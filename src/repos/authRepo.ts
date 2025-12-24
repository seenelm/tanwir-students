import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { BaseRepository } from './base';
import { AuthorizedUser } from '../services/auth';

export class AuthRepository extends BaseRepository<AuthorizedUser> {
  constructor() {
    super('authorizedUsers');
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user.email) {
      await signOut(auth);
      throw new Error('Google account missing email');
    }

    return user;
  }

  async signInWithEmailPassword(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async ensureAuthorizedUser(user: User): Promise<AuthorizedUser> {
    // Try UID
    let existing = await this.getById(user.uid);

    // Fallback to email
    if (!existing && user.email) {
      const found = await this.findOneByField('email', user.email);
      if (found) {
        await this.set(user.uid, { ...found.data, uid: user.uid });
        await this.delete(found.id);
        existing = found.data;
      }
    }

    if (!existing) {
      throw new Error('Unauthorized user');
    }

    return existing;
  }
}
