import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { auth } from '../../config/firebase';
import { UserRole, AuthorizedUser } from './types';

export interface IAuthService {
  getAllUsers(): Promise<AuthorizedUser[]>;
  getUserRole(): Promise<UserRole | null>;
  getCurrentUser(): any;
}

export class AuthService implements IAuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async getAllUsers(): Promise<AuthorizedUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      const users = usersSnapshot.docs.map((doc: DocumentData) => {
        const data = doc.data();
        return {
          uid: doc.id,
          FirstName: data.FirstName || '',
          LastName: data.LastName || '',
          displayName: data.displayName || null,
          email: data.email || null
        };
      });
      
      console.log('All users with document IDs:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserRole(): Promise<UserRole | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDocs(collection(db, 'users'));
      const userData = userDoc.docs.find(doc => doc.id === user.uid);
      return userData?.data().role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
} 