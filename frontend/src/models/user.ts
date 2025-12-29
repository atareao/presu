// user.rs
export interface User {
  id?: number;
  username: string;
  email: string;
  hashed_password: string;
  role_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}
