export type LeadStage = "NEW" | "BAAT HUI" | "QUOTE" | "PAKKI" | "LOST";
export type LeadScore = "Hot" | "Warm" | "Cold";
export type LeadSource = "Instagram DM" | "WhatsApp" | "Website" | "Call" | "Walk-in";

export interface LeadHistoryEntry {
  id: string;
  lead_id: string;
  date: string;
  kisne_baat_ki: string;
  kya_baat_hui: string;
}

export interface LeadRecord {
  id: string;
  naam: string;
  phone: string;
  source: LeadSource;
  query: string;
  quote: string;
  stage: LeadStage;
  score: LeadScore;
  next_followup: string;
  followup_status: "Today" | "Missed" | "Upcoming" | "Quote3Days";
  assigned_to: string;
  createdAt: string;
  history: LeadHistoryEntry[];
}

interface LeadsState {
  leads: LeadRecord[];
}

const initialLeads: LeadRecord[] = [
  {
    id: "lead-1",
    naam: "Priya Sharma",
    phone: "9829011223",
    source: "Instagram DM",
    query: "Bridal Red Lehenga + Blouse Stitching",
    quote: "₹15,000",
    stage: "QUOTE",
    score: "Hot",
    next_followup: "Aaj 11:00 AM",
    followup_status: "Today",
    assigned_to: "Ravi",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    history: [
      {
        id: "lh-1",
        lead_id: "lead-1",
        date: "3 din pehle",
        kisne_baat_ki: "Neha",
        kya_baat_hui: "Instagram DM par Bridal Lehenga catalog aur ₹15,000 quote bheja.",
      },
      {
        id: "lh-2",
        lead_id: "lead-1",
        date: "Kal 4:30 PM",
        kisne_baat_ki: "Ravi",
        kya_baat_hui: "Call par baat hui, M size trial ke liye aaj 11 baje aayengi.",
      },
    ],
  },
  {
    id: "lead-2",
    naam: "Kavita Verma",
    phone: "9829044556",
    source: "WhatsApp",
    query: "Diwali Party Wear Anarkali Suit (L)",
    quote: "₹4,800",
    stage: "BAAT HUI",
    score: "Warm",
    next_followup: "Kal Miss Ho Gaya",
    followup_status: "Missed",
    assigned_to: "Neha",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    history: [
      {
        id: "lh-3",
        lead_id: "lead-2",
        date: "2 din pehle",
        kisne_baat_ki: "Neha",
        kya_baat_hui: "WhatsApp par Gold Anarkali ki photos bheji, family se pooch rahi hain.",
      },
    ],
  },
  {
    id: "lead-3",
    naam: "Meera Joshi",
    phone: "9829077889",
    source: "Call",
    query: "5 Festive Kurtis Bulk Order",
    quote: "₹6,000",
    stage: "QUOTE",
    score: "Hot",
    next_followup: "Quote 3 Din Purana",
    followup_status: "Quote3Days",
    assigned_to: "Ravi",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    history: [
      {
        id: "lh-4",
        lead_id: "lead-3",
        date: "3 din pehle",
        kisne_baat_ki: "Ravi",
        kya_baat_hui: "₹6,000 ka combo quote WhatsApp par bheja tha, abhi follow-up karna hai.",
      },
    ],
  },
  {
    id: "lead-4",
    naam: "Neha Agarwal",
    phone: "9829099001",
    source: "Instagram DM",
    query: "Maroon Velvet Gown (M)",
    quote: "₹8,900",
    stage: "NEW",
    score: "Hot",
    next_followup: "Aaj 2:00 PM",
    followup_status: "Today",
    assigned_to: "Neha",
    createdAt: new Date().toISOString(),
    history: [
      {
        id: "lh-5",
        lead_id: "lead-4",
        date: "Aaj 10:15 AM",
        kisne_baat_ki: "AI Chatbot",
        kya_baat_hui: "Instagram DM par Gown ka price aur M size availability poocha.",
      },
    ],
  },
  {
    id: "lead-5",
    naam: "Sunita Devi",
    phone: "9876543211",
    source: "Walk-in",
    query: "Blue Banarasi Saree",
    quote: "₹3,500",
    stage: "PAKKI",
    score: "Hot",
    next_followup: "Done ✓",
    followup_status: "Upcoming",
    assigned_to: "Ravi",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    history: [
      {
        id: "lh-6",
        lead_id: "lead-5",
        date: "5 din pehle",
        kisne_baat_ki: "Ravi",
        kya_baat_hui: "Deal pakki! UPI payment received aur saree deliver ho gayi.",
      },
    ],
  },
  {
    id: "lead-6",
    naam: "Pooja Rathore",
    phone: "9829033445",
    source: "Website",
    query: "Silk Saree (Budget ₹1,500)",
    quote: "₹3,500",
    stage: "LOST",
    score: "Cold",
    next_followup: "Closed",
    followup_status: "Upcoming",
    assigned_to: "Neha",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    history: [
      {
        id: "lh-7",
        lead_id: "lead-6",
        date: "7 din pehle",
        kisne_baat_ki: "Neha",
        kya_baat_hui: "Customer ko ₹1,500 range me chahiye tha, abhi budget match nahi hua.",
      },
    ],
  },
];

const globalLeads = globalThis as unknown as {
  leadsStore: LeadsState | undefined;
};

export const leadsStore: LeadsState =
  globalLeads.leadsStore ?? { leads: initialLeads };

if (process.env.NODE_ENV !== "production") {
  globalLeads.leadsStore = leadsStore;
}
