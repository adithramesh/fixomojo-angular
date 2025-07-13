

export interface HomeResponseDTO {
  services: {
    serviceId: string;
    serviceName: string;
  }[];
  subServices?: string[]; // keep if needed
  offers?: string[];      // keep if needed
}