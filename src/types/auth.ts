export type UserRole = 'student' | 'admin';
export interface AuthorizedUser {
  uid: string;
  CreatedAt?: Date;
  FirstName?: string;
  LastName?: string;
  displayName?: string;
  Role: UserRole;
  email?: string;
  password?: string;
  courses?: { courseRef: string }[];
}