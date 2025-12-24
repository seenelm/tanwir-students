import { onAuthStateChanged } from 'firebase/auth';
import { QueryClient } from '@tanstack/react-query';
import { auth } from '../config/firebase';
import { AuthService } from '../services/auth';

export function initAuthListener(queryClient: QueryClient) {
  const authService = AuthService.getInstance();

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      queryClient.setQueryData(['auth'], null);
      return;
    }

    try {
      const userData = await authService.getUserData(firebaseUser.uid);

      const fullUserData = userData
        ? {
            ...userData,
            uid: firebaseUser.uid,
            email: userData.email ?? firebaseUser.email,
            displayName: firebaseUser.displayName,
            FirstName:
              userData.FirstName ??
              firebaseUser.displayName?.split(' ')[0],
            LastName:
              userData.LastName ??
              firebaseUser.displayName?.split(' ').slice(1).join(' ')
          }
        : null;

      queryClient.setQueryData(['auth'], fullUserData);
    } catch (err) {
      console.error('Auth bootstrap failed:', err);
      queryClient.setQueryData(['auth'], null);
    }
  });
}
