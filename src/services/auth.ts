import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc, Firestore, deleteDoc } from 'firebase/firestore';

export type UserRole = 'student' | 'admin';

export interface AuthorizedUser {
  uid: string;
  CreatedAt: Date;
  FirstName: string;
  LastName: string;
  Role: UserRole;
  email?: string;
  password?: string;
}

export class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private db: Firestore;

  private constructor() {
    this.db = getFirestore();
    onAuthStateChanged(auth, (user) => {
      this.authStateListeners.forEach(listener => listener(user));
    });
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async signInWithGoogle(): Promise<User | null> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      if (!user.email) {
        await this.signOut();
        throw new Error('Google account missing email.');
      }
  
      const existingUser = await this.findUserByEmail(user.email);
      if (!existingUser) {
        await this.signOut();
        throw new Error('Unauthorized user. Please contact an administrator.');
      }
  
      // Check if the user's Firebase Auth UID matches their document ID in authorizedUsers
      if (existingUser.id !== user.uid) {
        console.log('⚠️ User document ID does not match Firebase Auth UID. Updating...');
        
        try {
          // Copy the existing user data to a new document with the Firebase Auth UID
          await setDoc(doc(this.db, 'authorizedUsers', user.uid), {
            ...existingUser.data,
            uid: user.uid // Update the UID field to match Firebase Auth UID
          });
          
          // Delete the old document to match email/password authentication behavior
          await deleteDoc(doc(this.db, 'authorizedUsers', existingUser.id));
          
          console.log('✅ Updated user document ID to match Firebase Auth UID');
        } catch (updateError) {
          console.error('Failed to update user document ID:', updateError);
          // Continue with sign-in even if the update fails
        }
      }
  
      // Check if current Firebase Auth user has a different sign-in method
      const methods = await fetchSignInMethodsForEmail(auth, user.email);
      if (methods.includes('password') && !methods.includes('google.com')) {
        // Already registered with email/password, try linking
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          try {
            const currentUser = auth.currentUser;
            if (currentUser) {
              await linkWithCredential(currentUser, credential);
              console.log('🔗 Linked Google to existing email/password account');
            }
          } catch (linkError) {
            console.warn('Failed to link Google account:', linkError);
          }
        }
      }
  
      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error.message);
      throw error;
    }
  }
  
  

  async signInWithEmailPassword(email: string, password: string): Promise<User | null> {
    try {
      // First authenticate with Firebase
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
  
      console.log('✅ Email/password sign-in success:', {
        uid: user.uid,
        email: user.email
      });
  
      // Check if they are authorized in the current user document
      const userDoc = await getDoc(doc(this.db, 'authorizedUsers', user.uid));
      
      if (!userDoc.exists()) {
        // If not found by UID, try to find by email
        const existingUser = await this.findUserByEmail(user.email || '');
        
        if (!existingUser) {
          // No matching user found in authorizedUsers collection
          console.warn('❌ Not an authorized user. Signing out.');
          await this.signOut();
          throw new Error('Unauthorized user. Please contact an administrator.');
        }
        
        // Found user by email but with different UID, update the document
        console.log('⚠️ User document ID does not match Firebase Auth UID. Updating...');
        
        try {
          // Copy the existing user data to a new document with the Firebase Auth UID
          await setDoc(doc(this.db, 'authorizedUsers', user.uid), {
            ...existingUser.data,
            uid: user.uid // Update the UID field to match Firebase Auth UID
          });
          
          // Delete the old document (optional, may want to keep for reference)
          await deleteDoc(doc(this.db, 'authorizedUsers', existingUser.id));
          
          console.log('✅ Updated user document ID to match Firebase Auth UID');
        } catch (updateError) {
          console.error('Failed to update user document ID:', updateError);
          // Continue with sign-in even if the update fails
        }
      }
  
      return user;
    } catch (error: any) {
      console.error('Email/password sign-in failed:', error.message);
      throw error;
    }
  }
  
  

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.authStateListeners.push(callback);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
    };
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getUserData(userId: string): Promise<AuthorizedUser | null> {
    try {
      const userDoc = await getDoc(doc(this.db, 'authorizedUsers', userId));
      
      if (userDoc.exists()) {
        return userDoc.data() as AuthorizedUser;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async getUserIdByEmail(email: string): Promise<string | null> {
    try {
      const usersRef = collection(this.db, 'authorizedUsers');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async getUserIdByName(name: string): Promise<string | null> {
    try {
      const usersRef = collection(this.db, 'authorizedUsers');
      const querySnapshot = await getDocs(usersRef);
      
      const nameLower = name.toLowerCase();
      
      for (const doc of querySnapshot.docs) {
        const userData = doc.data();
        const firstName = (userData.FirstName || '').toLowerCase();
        const lastName = (userData.LastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        
        if (firstName.includes(nameLower) || 
            lastName.includes(nameLower) || 
            fullName.includes(nameLower)) {
          return doc.id;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user by name:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<AuthorizedUser[]> {
    const usersRef = collection(this.db, 'authorizedUsers');
    const querySnapshot = await getDocs(usersRef);
    const users = querySnapshot.docs.map(doc => ({
      ...doc.data() as AuthorizedUser,
      uid: doc.id  
    }));
    console.log('Fetched users with document IDs:', users);
    return users;
  }

  async createAuthorizedUser(user: User, role: UserRole = 'student'): Promise<void> {
    if (!user.uid || !user.email) throw new Error('User must have UID and email');

    const userData: AuthorizedUser = {
      uid: user.uid,
      CreatedAt: new Date(),
      FirstName: user.displayName?.split(' ')[0] || '',
      LastName: user.displayName?.split(' ')[1] || '',
      Role: role
    };

    try {
      await setDoc(doc(this.db, 'authorizedUsers', user.uid), userData);
      console.log('Authorized user created successfully with role:', role);
    } catch (error) {
      console.error('Error creating authorized user:', error);
      throw error;
    }
  }

  async getUserRole(): Promise<UserRole | null> {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const userData = await this.getUserData(user.uid);
    return userData?.Role || null;
  }

  async findUserByEmail(email: string): Promise<{ id: string, data: AuthorizedUser } | null> {
    try {
      const usersRef = collection(this.db, 'authorizedUsers');
      
      // Try both email and customerEmail fields since we don't know which one is used
      const emailQuery = query(usersRef, where('email', '==', email));
      const customerEmailQuery = query(usersRef, where('customerEmail', '==', email));
      
      // Check both queries
      let querySnapshot = await getDocs(emailQuery);
      
      if (querySnapshot.empty) {
        // If no results with 'email', try 'customerEmail'
        querySnapshot = await getDocs(customerEmailQuery);
      }
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          data: doc.data() as AuthorizedUser
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }
}
