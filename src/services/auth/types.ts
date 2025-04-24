export type UserRole = 'admin' | 'student' | null;

export interface AuthorizedUser {
  uid: string;
  FirstName: string;
  LastName: string;
  displayName: string | null;
  email: string | null;
  role?: UserRole;
} 