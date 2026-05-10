export interface RegisterResponseDTO {
  id: string;
  email: string;
  full_name: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseDTO {
  id: string;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}

export interface MeResponseDTO {
  id: string;
  email: string;
  full_name: string;
  role: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordResponseDTO {
  message: string;
  resetToken?: string;
}

export interface ChangePasswordResponseDTO {
  message: string;
}
