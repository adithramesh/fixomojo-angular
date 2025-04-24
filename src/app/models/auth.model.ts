enum Role{
  USER = "user",
  PARTNER = "partner",
  ADMIN = "admin",
}
export interface SignupUserRequestDTO{
  username: string;
    email: string;
    phoneNumber: string; 
    password: string;
    role?: Role
    serviceType?: string; // Optional field
    adminCode?: string; // Optional, maybe for admin signup
    department?: string; // Optional
}

export interface SignupResponseDTO {
  success: boolean;
  data?: {
      id: string; 
      username:string;
      email: string;
      phoneNumber:string;
      role: Role;
  };
  message: string;
  tempUserId?:string;
  access_token?: string;
  refresh_token?: string;
  reset_token?:string;
  context?:"signup" | "forgot-password"
  status: number;
}

export interface OtpRequestDTO{
  tempUserId:string
  otp:string
  context?:"signup" | "forgot-password"
}

export interface OtpResendRequestDTO{
  tempUserId:string
  phoneNumber:string
  context?:'signup' | 'forgot-password'
}

export interface ForgotPasswordRequestDTO {
  phoneNumber:string
}

export interface ResetPasswordRequestDTO {
  tempUserId:string,
  reset_token:string,
  newPassword:string
}

export interface LoginRequestDTO {
  phoneNumber:string,
  password:string
}

