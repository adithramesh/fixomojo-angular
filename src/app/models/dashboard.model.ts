export interface AdminDashboardResponseDTO {
  totalRevenue:number;
  totalBookings:number;
  activePartners:number;
  totalCustomers:number;
  bookingStatusDistribution?: { status: string; count: number }[];
  revenueTrends?: { week: number; totalRevenue: number }[];
}


export interface PartnerDashboardResponseDTO {
  totalRevenue:number;
  totalBookings:number;
  completedBookings:number;
  cancelledBookings:number
  avgTaskPerDay?:number
}