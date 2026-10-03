export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    token?: string;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
