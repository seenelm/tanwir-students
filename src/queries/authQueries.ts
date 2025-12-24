// authQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthRepository } from '../repos/authRepo';
import { useAuth } from '../context/AuthContext';

const repo = new AuthRepository();
const AUTH_KEY = ['auth'];

export const useAuthUser = () =>
  useQuery({
    queryKey: AUTH_KEY,
    queryFn: () => repo.getCurrentUser(),
    staleTime: Infinity,
  });

export const useSignInWithGoogle = () => {
  const qc = useQueryClient();
  const authRepo = new AuthRepository();
  const { setUser } = useAuth(); // 👈 context write

  return useMutation({
    mutationFn: async () => {
      const firebaseUser = await authRepo.signInWithGoogle();
      const authorizedUser = await authRepo.ensureAuthorizedUser(firebaseUser);
      return authorizedUser;
    },
    onSuccess: (authorizedUser) => {
      setUser(authorizedUser);        // 🔥 hydrate once
      qc.setQueryData(['auth'], true); // optional auth flag
    },
  });
};

export const useSignInWithEmailPassword = () => {
  const qc = useQueryClient();
  const authRepo = new AuthRepository();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const firebaseUser = await authRepo.signInWithEmailPassword(email, password);
      const authorizedUser = await authRepo.ensureAuthorizedUser(firebaseUser);
      return authorizedUser;
    },
    onSuccess: (authorizedUser) => {
      setUser(authorizedUser);
      qc.setQueryData(['auth'], true);
    },
  });
};
export const useSignOut = () => {
  const qc = useQueryClient();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: () => repo.signOut(),
    onSuccess: () => {
      setUser(null);
      qc.setQueryData(AUTH_KEY, null);
    },
  });
};
