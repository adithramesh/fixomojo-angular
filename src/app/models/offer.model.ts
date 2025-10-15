export interface OfferDataDTO  {
  _id?:string;
  title: string;
  description: string;
  offer_type: 'global' | 'service_category' | 'first_time_user';
  serviceId?: string;
  discount_type: 'percentage' | 'flat_amount';
  discount_value: number;
  max_discount?: number;
  min_booking_amount?: number;
  valid_until?: Date;
  status?: string;
}

export interface OfferApiResponse {
  success: boolean;
  message: string;
  data: {
    offers: OfferDataDTO[];
    pagination: {
      total: number;
      page: number;
      pages: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };

 
}

 export interface ServiceLookupDTO {
    id: string;
    serviceName: string;
}
