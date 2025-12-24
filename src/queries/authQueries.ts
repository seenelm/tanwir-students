// authQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthRepository } from '../repos/authRepo';
import { AuthService } from '../services/auth';
import { auth } from '../config/firebase';

const repo = new AuthRepository();
const AUTH_KEY = ['auth'];

// Query to get the current authenticated user with full data
export const useAuthUser = () => {
  const authService = AuthService.getInstance();
  
  return useQuery({
    queryKey: AUTH_KEY,
    queryFn: async () => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;
      
      const userData = await authService.getUserData(firebaseUser.uid);
      
      // Merge Firebase user data with Firestore data
      return userData ? {
        ...userData,
        uid: firebaseUser.uid,
        email: userData.email || firebaseUser.email || undefined,
        displayName: firebaseUser.displayName || undefined,
        FirstName: userData.FirstName || firebaseUser.displayName?.split(' ')[0] || undefined,
        LastName: userData.LastName || firebaseUser.displayName?.split(' ').slice(1).join(' ') || undefined
      } : null;
    },
    staleTime: Infinity,
    // This will be updated when auth state changes via the mutation below
  });
};

export const useSignInWithGoogle = () => {
  const qc = useQueryClient();
  const authRepo = new AuthRepository();

  return useMutation({
    mutationFn: async () => {
      const firebaseUser = await authRepo.signInWithGoogle();
      const authorizedUser = await authRepo.ensureAuthorizedUser(firebaseUser);
      return authorizedUser;
    },
    onSuccess: () => {
      // Auth state listener will update the cache automatically
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useSignInWithEmailPassword = () => {
  const qc = useQueryClient();
  const authRepo = new AuthRepository();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const firebaseUser = await authRepo.signInWithEmailPassword(email, password);
      const authorizedUser = await authRepo.ensureAuthorizedUser(firebaseUser);
      return authorizedUser;
    },
    onSuccess: () => {
      // Auth state listener will update the cache automatically
      qc.invalidateQueries({ queryKey: ['auth'] });
    },
  });
};

export const useSignOut = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => repo.signOut(),
    onSuccess: () => {
      // Auth state listener will update the cache automatically
      qc.setQueryData(AUTH_KEY, null);
    },
  });
};
