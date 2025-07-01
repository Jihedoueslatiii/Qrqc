export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}