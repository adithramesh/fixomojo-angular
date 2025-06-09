export interface PaginationRequestDTO {
    page: number;
    pageSize: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    filter?:any;
    // filter?: Record<string, any>;
  }
  
export interface PaginatedResponseDTO<T> {
    items: T;
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }

export interface UserResponseDTO {
    id: string | number;
    username: string;
    phoneNumber: string;
    email:string;
    status: string;
    licenseStatus:string;
    role: string;
    location?: {
      address?: string;
      latitude: number;
      longitude: number;
    };
    experience?:number;
    rating?:number;
    createdAt?: string;
}

export interface ServiceRequestDTO {
  serviceName: string;
  image: string;
  description?: string;
}

export interface ServiceResponseDTO {
  id?: string | number;
  serviceName: string;
  image?: string;
  description?: string;
  status: string;
  // subServices: SubServiceResponseDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubServiceRequestDTO {
  serviceId?:string;
  subServiceName: string;
  price: number;
  description?: string;
  image?: string;
  status: 'active' | 'blocked' | 'suspended' | 'deleted';
}

export interface SubServiceResponseDTO {
  id: string;
  subServiceName: string;
  serviceName:string;
  price: number;
  description?: string;
  image?: string;
  status: 'active' | 'blocked' | 'suspended' | 'deleted';
  createdAt: string;
  updatedAt: string;
}

  
 