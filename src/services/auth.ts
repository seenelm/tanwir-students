import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

export type UserRole = 'student' | 'admin';

export interface AuthorizedUser {
  CreatedAt: Date;
  FirstName: string;
  LastName: string;
  Role: UserRole;
}

export class AuthService {
  private static instance: AuthService;
  private authStateListeners: ((user: User | null) => void)[] = [];

  private constructor() {
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
      
      // Check if user exists in authorizedUsers
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'authorizedUsers', result.user.uid));
      
      // If user doesn't exist, create them as a student
      if (!userDoc.exists()) {
        console.log('Creating new authorized user with student role');
        await this.createAuthorizedUser(result.user, 'student');
        return result.user;
      }
      
      // For existing users, check their authorization
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

  // private async checkUserAuthorization(user: User): Promise<boolean> {
  //   if (!user.uid) {
  //     console.log('No UID found for user');
  //     return false;
  //   }
    
  //   // Check if user exists in authorized users collection using UID
  //   const db = getFirestore();
  //   console.log('Checking authorization for UID:', user.uid);
  //   const userDoc = await getDoc(doc(db, 'authorizedUsers', user.uid));
  //   console.log('Authorization check result:', {
  //     exists: userDoc.exists(),
  //     data: userDoc.exists() ? userDoc.data() : null
  //   });
  //   return userDoc.exists();
  // }

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
      const db = getFirestore();
      const userDoc = await getDoc(doc(db, 'authorizedUsers', userId));
      
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
      const db = getFirestore();
      const usersRef = collection(db, 'authorizedUsers');
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

  async createAuthorizedUser(user: User, role: UserRole = 'student'): Promise<void> {
    if (!user.uid || !user.email) throw new Error('User must have UID and email');

    const db = getFirestore();
    const userData: AuthorizedUser = {
      CreatedAt: new Date(),
      FirstName: user.displayName?.split(' ')[0] || '',
      LastName: user.displayName?.split(' ')[1] || '',
      Role: role
    };

    try {
      await setDoc(doc(db, 'authorizedUsers', user.uid), userData);
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
}
