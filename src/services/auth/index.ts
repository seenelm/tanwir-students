import { collection, getDocs, DocumentData } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { auth } from '../../config/firebase';
import { UserRole, AuthorizedUser } from './types';

export interface IAuthService {
  getAllUsers(): Promise<AuthorizedUser[]>;
  getUserRole(uid?: string): Promise<UserRole | null>;
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

  async getUserRole(uid?: string): Promise<UserRole | null> {
    try {
      const userId = uid || auth.currentUser?.uid;
      if (!userId) {
        console.log('getUserRole: No user ID available');
        return null;
      }

      console.log('getUserRole: Checking role for user:', userId);
      const usersCollection = collection(db, 'authorizedUsers');
      const userDocs = await getDocs(usersCollection);
      const userData = userDocs.docs.find(doc => doc.id === userId);
      
      if (!userData) {
        console.log('getUserRole: User not found in authorizedUsers');
        return null;
      }
      
      const data = userData.data();
      const role = data.Role || data.role || null;
      console.log('getUserRole: Found role:', role, 'for user:', userId);
      
      return role as UserRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  getCurrentUser() {
    return auth.currentUser;
  }
} 