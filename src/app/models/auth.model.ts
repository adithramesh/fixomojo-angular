export interface UserSignUpData{
  username :string;
  email:string;
  phoneNumber: number;
  password:string;
  confirmPassword:string;
  role:"user";
}

export interface PartnerSignUpData{
  username: string;
  email: string;
  phoneNumber: number;
  password: string;
  confirmPassword?: string;
  role: 'partner';
  serviceType: string;
  // aadharCardNumber: string;
}

export interface AdminSignupData {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword?: string;
  role: 'admin';
  adminCode: string;
  department: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone: number;
    role: 'user' | 'admin' | 'partner';
  }
  export interface Admin extends User {
    permissions: string[];
  }
  export interface Partner extends User {
    servicesOffered: string[];
    rating: number;
  }
  