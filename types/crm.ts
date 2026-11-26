export type TabKey =
  | "Leads"
  | "Pipeline"
  | "Follow-ups"
  | "Customers"
  | "Omnichannel"
  | "Inbox"
  | "Stock"
  | "Staff"
  | "Marketing"
  | "Udhaar"
  | "Measurement"
  | "Reports"
  | "Integrations"
  | "Settings";

export interface DashboardAlert {
  id: string;
  type: "birthday" | "inactive" | "low_stock";
  title: string;
  actionLabel: string;
  phone?: string;
  customerName?: string;
}

export interface StatsData {
  aajKiSale: number;
  isMahineKiSale: number;
  totalCustomers: number;
  nayeCustomer: number;
  topSellingItem: string;
  udhaarBaki: number;
  lowStockCount: number;
  aajCustomerAaye: number;
  alerts: DashboardAlert[];
}

export interface LeadSummary {
  todayLeads: number;
  pendingFollowups: number;
  monthlyLeads: number;
  monthlyPakki: number;
  bestSource: string;
}

export interface CustomerRow {
  id: string;
  name: string;
  phone: string;
  city: string;
  size: string;
  pasand: string;
  total_kharida: number;
  lastItem: string;
  is_vip: boolean;
  is_inactive: boolean;
}

export interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  photo_url: string;
  stocks: {
    id: string;
    size: string;
    quantity: number;
    low_stock_threshold: number;
  }[];
}

export interface StaffRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  target_monthly: number;
  commission_percent: number;
  current_sale: number;
  attendance?: "Present" | "Absent" | "Half Day";
}

export interface UdhaarRow {
  id: string;
  amount: number;
  due_date: string;
  status: "Pending" | "Paid";
  customer: { name: string; phone: string };
}

export interface MeasurementRow {
  id: string;
  blouse: string;
  sleeve: string;
  length: string;
  waist: string;
  shoulder: string;
  status: string;
  delivery_date: string | null;
  customer: { id: string; name: string; phone: string };
}

export interface CampaignRow {
  id: string;
  title: string;
  template: string;
  sent_to_count: number;
  createdAt: string;
}

export interface ReportsData {
  dailySale: number;
  monthlySale: number;
  totalBills: number;
  paymentBreakdown: { Cash: number; UPI: number; Card: number; Udhaar: number };
  itemReport: { name: string; qty: number; revenue: number }[];
  staffReport: { name: string; role: string; sale: number; target: number }[];
  customerReport: {
    name: string;
    phone: string;
    total: number;
    is_vip: boolean;
  }[];
}

export interface ShopProfile {
  name: string;
  address: string;
  phone: string;
  tagline: string;
}
