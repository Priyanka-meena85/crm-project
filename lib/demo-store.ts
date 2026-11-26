export interface DemoCustomer {
  id: string;
  name: string;
  phone: string;
  city: string;
  birthday: string | null;
  anniversary: string | null;
  size: string;
  pasand: string;
  total_kharida: number;
  last_visit: string;
  is_vip: boolean;
  is_inactive: boolean;
  lastItem?: string;
}

export interface DemoProduct {
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

export interface DemoStaff {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: "OWNER" | "STAFF";
  target_monthly: number;
  commission_percent: number;
  current_sale: number;
  attendance: "Present" | "Absent" | "Half Day";
}

export interface DemoBill {
  id: string;
  bill_no: number;
  customer_id: string;
  staff_id: string;
  total: number;
  discount: number;
  final_total: number;
  payment_method: string;
  status: string;
  createdAt: string;
  customer: DemoCustomer;
  staff: DemoStaff;
  items: {
    id: string;
    product_id: string;
    size: string;
    qty: number;
    price: number;
    product: DemoProduct;
  }[];
}

export interface DemoUdhaar {
  id: string;
  customer_id: string;
  amount: number;
  due_date: string;
  status: "Pending" | "Paid";
  customer: { name: string; phone: string };
}

export interface DemoMeasurement {
  id: string;
  customer_id: string;
  blouse: string;
  sleeve: string;
  length: string;
  waist: string;
  shoulder: string;
  status: string;
  delivery_date: string | null;
  customer: { id: string; name: string; phone: string };
}

export interface DemoCampaign {
  id: string;
  title: string;
  template: string;
  sent_to_count: number;
  createdAt: string;
}

export interface ShopProfile {
  name: string;
  address: string;
  phone: string;
  tagline: string;
}

interface DemoStoreState {
  nextBillNo: number;
  customers: DemoCustomer[];
  products: DemoProduct[];
  staff: DemoStaff[];
  bills: DemoBill[];
  udhaars: DemoUdhaar[];
  measurements: DemoMeasurement[];
  campaigns: DemoCampaign[];
  shopProfile: ShopProfile;
}

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const sixMonthsAgo = new Date();
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

const staffList: DemoStaff[] = [
  {
    id: "staff-priya",
    name: "Priya",
    phone: "9829012345",
    email: "owner@priya.com",
    role: "OWNER",
    target_monthly: 250000,
    commission_percent: 0,
    current_sale: 45000,
    attendance: "Present",
  },
  {
    id: "staff-raju",
    name: "Raju",
    phone: "9829012346",
    email: "raju@priya.com",
    role: "STAFF",
    target_monthly: 100000,
    commission_percent: 2,
    current_sale: 28000,
    attendance: "Present",
  },
  {
    id: "staff-pooja",
    name: "Pooja",
    phone: "9829012347",
    email: "pooja@priya.com",
    role: "STAFF",
    target_monthly: 100000,
    commission_percent: 2,
    current_sale: 17000,
    attendance: "Present",
  },
];

const customersList: DemoCustomer[] = [
  {
    id: "cust-anjali",
    name: "Anjali Sharma",
    phone: "9876543210",
    city: "Nathdwara",
    birthday: tomorrow.toISOString(),
    anniversary: null,
    size: "M",
    pasand: "Red & Maroon Bridal Wear, Banarasi Silk",
    total_kharida: 55000,
    last_visit: new Date().toISOString(),
    is_vip: true,
    is_inactive: false,
    lastItem: "Red Lehenga",
  },
  {
    id: "cust-sunita",
    name: "Sunita Devi",
    phone: "9876543211",
    city: "Nathdwara",
    birthday: null,
    anniversary: null,
    size: "L",
    pasand: "Cotton Kurti, Pastel Suits",
    total_kharida: 52000,
    last_visit: new Date(Date.now() - 10 * 86400000).toISOString(),
    is_vip: true,
    is_inactive: false,
    lastItem: "Blue Saree",
  },
  {
    id: "cust-ramesh",
    name: "Ramesh Kumar",
    phone: "9876543212",
    city: "Rajsamand",
    birthday: null,
    anniversary: null,
    size: "XL",
    pasand: "Festive Kurta & Family Sarees",
    total_kharida: 18500,
    last_visit: sixMonthsAgo.toISOString(),
    is_vip: false,
    is_inactive: true,
    lastItem: "Red Kurti",
  },
];

const productsList: DemoProduct[] = [
  {
    id: "prod-red-kurti",
    name: "Red Kurti",
    category: "Kurti",
    price: 1200,
    photo_url:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
    stocks: [
      { id: "st-1", size: "S", quantity: 5, low_stock_threshold: 2 },
      { id: "st-2", size: "M", quantity: 1, low_stock_threshold: 2 },
      { id: "st-3", size: "L", quantity: 3, low_stock_threshold: 2 },
      { id: "st-4", size: "XL", quantity: 4, low_stock_threshold: 2 },
    ],
  },
  {
    id: "prod-red-lehenga",
    name: "Red Lehenga",
    category: "Lehenga",
    price: 15000,
    photo_url:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
    stocks: [
      { id: "st-5", size: "S", quantity: 2, low_stock_threshold: 2 },
      { id: "st-6", size: "M", quantity: 3, low_stock_threshold: 2 },
      { id: "st-7", size: "L", quantity: 0, low_stock_threshold: 2 },
    ],
  },
  {
    id: "prod-blue-saree",
    name: "Blue Saree",
    category: "Saree",
    price: 3500,
    photo_url:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
    stocks: [
      { id: "st-8", size: "M", quantity: 6, low_stock_threshold: 2 },
      { id: "st-9", size: "L", quantity: 4, low_stock_threshold: 2 },
    ],
  },
  {
    id: "prod-gold-anarkali",
    name: "Gold Anarkali Suit",
    category: "Suit",
    price: 4800,
    photo_url:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&q=80",
    stocks: [
      { id: "st-10", size: "S", quantity: 3, low_stock_threshold: 2 },
      { id: "st-11", size: "M", quantity: 1, low_stock_threshold: 2 },
      { id: "st-12", size: "L", quantity: 5, low_stock_threshold: 2 },
    ],
  },
  {
    id: "prod-maroon-gown",
    name: "Maroon Velvet Gown",
    category: "Gown",
    price: 8900,
    photo_url:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
    stocks: [
      { id: "st-13", size: "M", quantity: 2, low_stock_threshold: 2 },
      { id: "st-14", size: "L", quantity: 2, low_stock_threshold: 2 },
    ],
  },
];

const initialState: DemoStoreState = {
  nextBillNo: 1025,
  staff: staffList,
  customers: customersList,
  products: productsList,
  bills: [
    {
      id: "bill-1024",
      bill_no: 1024,
      customer_id: "cust-anjali",
      staff_id: "staff-raju",
      total: 15000,
      discount: 0,
      final_total: 15000,
      payment_method: "UPI",
      status: "Paid",
      createdAt: new Date().toISOString(),
      customer: customersList[0],
      staff: staffList[1],
      items: [
        {
          id: "bi-1024-1",
          product_id: "prod-red-lehenga",
          size: "M",
          qty: 1,
          price: 15000,
          product: productsList[1],
        },
      ],
    },
  ],
  udhaars: [
    {
      id: "udh-1",
      customer_id: "cust-ramesh",
      amount: 2000,
      due_date: new Date(Date.now() + 1 * 86400000).toISOString(),
      status: "Pending",
      customer: { name: "Ramesh Kumar", phone: "9876543212" },
    },
    {
      id: "udh-2",
      customer_id: "cust-sunita",
      amount: 3500,
      due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      status: "Pending",
      customer: { name: "Sunita Devi", phone: "9876543211" },
    },
  ],
  measurements: [
    {
      id: "meas-1",
      customer_id: "cust-anjali",
      blouse: "34",
      sleeve: "11",
      length: "14.5",
      waist: "28",
      shoulder: "14",
      status: "Sil Raha Hai",
      delivery_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      customer: { id: "cust-anjali", name: "Anjali Sharma", phone: "9876543210" },
    },
    {
      id: "meas-2",
      customer_id: "cust-sunita",
      blouse: "38",
      sleeve: "9",
      length: "15",
      waist: "32",
      shoulder: "15",
      status: "Ready Hai",
      delivery_date: new Date(Date.now() + 1 * 86400000).toISOString(),
      customer: { id: "cust-sunita", name: "Sunita Devi", phone: "9876543211" },
    },
  ],
  campaigns: [
    {
      id: "camp-1",
      title: "Diwali Offer",
      template:
        "Namaste Didi! Priya Boutique Nathdwara me Diwali New Stock aa gaya hai. VIP customers ke liye 20% OFF!",
      sent_to_count: 500,
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  shopProfile: {
    name: "Priya Boutique",
    address: "Bada Bazar, Nathdwara, Rajasthan 313301",
    phone: "9829012345",
    tagline: "Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi",
  },
};

const globalForDemo = globalThis as unknown as {
  demoStore: DemoStoreState | undefined;
};

export const demoStore: DemoStoreState =
  globalForDemo.demoStore ?? initialState;

if (process.env.NODE_ENV !== "production") {
  globalForDemo.demoStore = demoStore;
}
