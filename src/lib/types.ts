export type RequestStatus = "pending" | "quoted" | "expired" | "cancelled";

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
}

export interface QuoteRequest {
  id: string;
  trackingCode: string;
  createdAt: string;
  updatedAt: string;
  status: RequestStatus;

  // اطلاعات مشتری
  customerName: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;

  // اقلام درخواستی
  items: QuoteItem[];
  notes?: string;

  // اطلاعات قیمت‌گذاری (توسط ادمین)
  validityDays?: number;
  validUntil?: string;
  totalAmount?: number;
  adminNotes?: string;
  quotedAt?: string;

  // فیلدهای جدید
  deliveryTime?: string;      // مدت زمان تحویل
  deliveryLocation?: string;  // محل تحویل
}

export interface AdminUser {
  username: string;
  passwordHash: string;
}
