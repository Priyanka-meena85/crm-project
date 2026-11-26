export type OrderChannel = "Website" | "Instagram" | "Offline Store";
export type CourierPartner = "Shiprocket" | "Delhivery" | "Bluedart" | "Store Pickup";
export type CourierStatus = "In-Transit" | "Out for Delivery" | "Delivered" | "Undelivered" | "Packed";

export interface OmnichannelOrder {
  id: string;
  orderNo: string;
  channel: OrderChannel;
  customerName: string;
  customerPhone: string;
  itemName: string;
  size: string;
  amount: number;
  paymentType: "Prepaid" | "COD";
  codRisk: "Low" | "High";
  codVerified: boolean;
  courier: CourierPartner;
  courierStatus: CourierStatus;
  trackingId: string;
  exchangeRequested?: boolean;
  qcStatus?: "Pending" | "OK" | "Damaged" | "Used";
  barcode: string;
  createdAt: string;
}

export interface InboxMessage {
  id: string;
  sender: "customer" | "agent";
  text: string;
  time: string;
}

export interface InboxThread {
  id: string;
  channel: "WhatsApp" | "Instagram DM" | "Facebook" | "Email";
  customerName: string;
  customerPhone: string;
  orderNo: string;
  orderAmount: number;
  orderStatus: string;
  unread: boolean;
  messages: InboxMessage[];
}

export interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  itemName: string;
  size: string;
  amount: number;
  abandonedAgo: string;
  recovered: boolean;
}

export interface QuickApproval {
  id: string;
  staffName: string;
  type: "Extra Discount" | "Special Refund";
  customerName: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface WishlistItem {
  id: string;
  customerName: string;
  phone: string;
  itemName: string;
  size: string;
  notified: boolean;
}

export interface IntegrationConfig {
  id: string;
  name: string;
  category: "E-Commerce" | "Communication" | "Logistics" | "Payments";
  provider: string;
  connected: boolean;
  apiKeyMask: string;
}

interface OmnichannelState {
  orders: OmnichannelOrder[];
  inbox: InboxThread[];
  abandonedCarts: AbandonedCart[];
  approvals: QuickApproval[];
  wishlist: WishlistItem[];
  integrations: IntegrationConfig[];
}

const initialOmnichannel: OmnichannelState = {
  orders: [
    {
      id: "ord-1",
      orderNo: "PB-2041",
      channel: "Website",
      customerName: "Anjali Sharma",
      customerPhone: "9876543210",
      itemName: "Red Lehenga",
      size: "M",
      amount: 15000,
      paymentType: "Prepaid",
      codRisk: "Low",
      codVerified: true,
      courier: "Bluedart",
      courierStatus: "Out for Delivery",
      trackingId: "BD99812031",
      barcode: "PB-LEH-M-01",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-2",
      orderNo: "PB-2042",
      channel: "Instagram",
      customerName: "Meera Joshi",
      customerPhone: "9829112233",
      itemName: "Gold Anarkali Suit",
      size: "L",
      amount: 4800,
      paymentType: "COD",
      codRisk: "High",
      codVerified: false,
      courier: "Shiprocket",
      courierStatus: "Packed",
      trackingId: "SR44510922",
      barcode: "PB-ANA-L-04",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ord-3",
      orderNo: "PB-2043",
      channel: "Website",
      customerName: "Sunita Devi",
      customerPhone: "9876543211",
      itemName: "Red Kurti",
      size: "M",
      amount: 1200,
      paymentType: "Prepaid",
      codRisk: "Low",
      codVerified: true,
      courier: "Delhivery",
      courierStatus: "Delivered",
      trackingId: "DL77201944",
      exchangeRequested: true,
      qcStatus: "Pending",
      barcode: "PB-KUR-M-02",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "ord-4",
      orderNo: "PB-2044",
      channel: "Offline Store",
      customerName: "Ramesh Kumar",
      customerPhone: "9876543212",
      itemName: "Blue Saree",
      size: "M",
      amount: 3500,
      paymentType: "COD",
      codRisk: "Low",
      codVerified: true,
      courier: "Store Pickup",
      courierStatus: "Delivered",
      trackingId: "STORE-NTD-04",
      barcode: "PB-SAR-M-09",
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  inbox: [
    {
      id: "th-1",
      channel: "WhatsApp",
      customerName: "Anjali Sharma",
      customerPhone: "9876543210",
      orderNo: "PB-2041",
      orderAmount: 15000,
      orderStatus: "Out for Delivery",
      unread: true,
      messages: [
        {
          id: "m1",
          sender: "customer",
          text: "Hi! Mera Red Lehenga aaj kab tak deliver hoga?",
          time: "10:12 AM",
        },
        {
          id: "m2",
          sender: "agent",
          text: "Namaste Anjali ji! Aapka order #PB-2041 Out for Delivery hai.",
          time: "10:14 AM",
        },
      ],
    },
    {
      id: "th-2",
      channel: "Instagram DM",
      customerName: "Meera Joshi",
      customerPhone: "9829112233",
      orderNo: "PB-2042",
      orderAmount: 4800,
      orderStatus: "COD Pending Confirm",
      unread: true,
      messages: [
        {
          id: "m3",
          sender: "customer",
          text: "Gold Anarkali Suit ka L size chest measurement kya hai?",
          time: "10:05 AM",
        },
      ],
    },
    {
      id: "th-3",
      channel: "Facebook",
      customerName: "Sunita Devi",
      customerPhone: "9876543211",
      orderNo: "PB-2043",
      orderAmount: 1200,
      orderStatus: "Size Exchange Requested",
      unread: false,
      messages: [
        {
          id: "m4",
          sender: "customer",
          text: "Red Kurti M tight hai, mujhe L size exchange chahiye.",
          time: "Yesterday",
        },
      ],
    },
    {
      id: "th-4",
      channel: "Email",
      customerName: "Ramesh Kumar",
      customerPhone: "9876543212",
      orderNo: "PB-2044",
      orderAmount: 3500,
      orderStatus: "Delivered",
      unread: false,
      messages: [
        {
          id: "m5",
          sender: "customer",
          text: "Please send GST invoice for Blue Saree order.",
          time: "2 days ago",
        },
      ],
    },
  ],
  abandonedCarts: [
    {
      id: "cart-1",
      customerName: "Kavita Sharma",
      phone: "9829055443",
      itemName: "Maroon Velvet Gown",
      size: "M",
      amount: 8900,
      abandonedAgo: "25 min pehle",
      recovered: false,
    },
    {
      id: "cart-2",
      customerName: "Neha Agarwal",
      phone: "9829077889",
      itemName: "Red Lehenga",
      size: "L",
      amount: 15000,
      abandonedAgo: "1 hr pehle",
      recovered: false,
    },
  ],
  approvals: [
    {
      id: "app-1",
      staffName: "Raju",
      type: "Extra Discount",
      customerName: "Anjali Sharma",
      amount: 1500,
      reason: "VIP Bridal Purchase ₹15,000+",
      status: "Pending",
    },
    {
      id: "app-2",
      staffName: "Pooja",
      type: "Special Refund",
      customerName: "Sunita Devi",
      amount: 1200,
      reason: "Kurti fitting issue exchange",
      status: "Pending",
    },
  ],
  wishlist: [
    {
      id: "wish-1",
      customerName: "Anjali Sharma",
      phone: "9876543210",
      itemName: "Red Kurti",
      size: "M",
      notified: false,
    },
  ],
  integrations: [
    {
      id: "int-1",
      name: "Shopify / WooCommerce Store",
      category: "E-Commerce",
      provider: "Shopify",
      connected: true,
      apiKeyMask: "shpat_••••••••92a1",
    },
    {
      id: "int-2",
      name: "WhatsApp Business API",
      category: "Communication",
      provider: "Wati / Interakt / AiSensy",
      connected: true,
      apiKeyMask: "wati_••••••••44f0",
    },
    {
      id: "int-3",
      name: "Instagram Graph API",
      category: "Communication",
      provider: "Meta Graph v19",
      connected: true,
      apiKeyMask: "ig_••••••••77c2",
    },
    {
      id: "int-4",
      name: "Shiprocket / Delhivery Courier",
      category: "Logistics",
      provider: "Shiprocket & Delhivery",
      connected: true,
      apiKeyMask: "sr_••••••••19b8",
    },
    {
      id: "int-5",
      name: "Razorpay / Cashfree Instant Refund",
      category: "Payments",
      provider: "Razorpay",
      connected: true,
      apiKeyMask: "rzp_live_••••88d1",
    },
  ],
};

const globalOmni = globalThis as unknown as {
  omnichannelStore: OmnichannelState | undefined;
};

export const omnichannelStore: OmnichannelState =
  globalOmni.omnichannelStore ?? initialOmnichannel;

if (process.env.NODE_ENV !== "production") {
  globalOmni.omnichannelStore = omnichannelStore;
}

