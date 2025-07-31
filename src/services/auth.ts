import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
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
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      
      console.log('Google sign in successful:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      
      if (!result.user.email) {
        console.error('User email is missing from Google auth result');
        await this.signOut();
        throw new Error('User email is required for authentication');
      }
      
      const existingUser = await this.findUserByEmail(result.user.email);
      
      if (existingUser) {
        const { id: oldId, data } = existingUser;
      
        if (oldId !== result.user.uid) {
          console.log(`Migrating Firestore user from ${oldId} to ${result.user.uid}`);
      
          // Prepare merged data
          const newData = {
            ...data,
            uid: result.user.uid,
            email: result.user.email,
            Role: 'student'
          };
      
          // Copy to new doc
          await setDoc(doc(this.db, 'authorizedUsers', result.user.uid), newData);
      
          // Delete old doc
          await deleteDoc(doc(this.db, 'authorizedUsers', oldId));
      
          console.log('Migration complete');
        }
      } else {
        console.log('Creating new authorized user with student role');
        await this.createAuthorizedUser(result.user, 'student');
      }
      
      const userDoc = await getDoc(doc(this.db, 'authorizedUsers', result.user.uid));
      
      const isAuthorized = userDoc.exists();
      console.log('User authorization check result:', isAuthorized);
      
      if (!isAuthorized) {
        console.log('User not authorized, signing out');
        await this.signOut();
        throw new Error('Unauthorized user. Access denied.');
      }
      
      return result.user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup window');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Another popup is already open');
      } else {
        console.error('Authentication error:', error.message);
      }
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
