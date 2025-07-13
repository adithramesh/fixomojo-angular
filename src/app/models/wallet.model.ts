export interface Transaction {
  _id: string; 
  userId?: string;
  amount: number;
  createdAt: string; 
  purpose: 'wallet-topup' | 'booking-payment' | 'commission';
  referenceId?: string; // Optional
  role?: 'user' | 'partner' | 'admin'; 
  transactionType: 'credit' | 'debit';
  updatedAt: string; 
}
