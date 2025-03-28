export interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'user' | 'admin' | 'partner';
  }
  export interface Admin extends User {
    permissions: string[];
  }
  export interface Partner extends User {
    servicesOffered: string[];
    rating: number;
  }
  