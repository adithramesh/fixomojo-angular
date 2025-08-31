

export interface HomeResponseDTO {
  services: {
    serviceId: string;
    serviceName: string;
  }[];
  subServices?: string[]; 
  offers?: string[];      
}