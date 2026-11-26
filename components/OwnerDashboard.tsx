"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CssAlertIcon,
  CssBagIcon,
  CssBellIcon,
  CssChartIcon,
  CssChatIcon,
  CssCheckIcon,
  CssCrownIcon,
  CssDiamondIcon,
  CssDocIcon,
  CssEditIcon,
  CssGearIcon,
  CssGridIcon,
  CssPhoneIcon,
  CssPlusIcon,
  CssTrashIcon,
  CssUserIcon,
} from "@/components/CssIcons";
import {
  OmnichannelOrdersTab,
  UnifiedInboxTab,
  IntegrationsTab,
} from "@/components/OmnichannelTabs";
import {
  LeadsWorkspace,
  HinglishAIChatbot,
} from "@/components/LeadsPipelineTabs";
import {
  BoutiqueButton,
  BoutiqueCard,
  BoutiqueModal,
  CountUpNumber,
  GoldDivider,
  VipBadge,
  WhatsAppButton,
} from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";
import { formatINR } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ReportsPanel } from "@/components/dashboard/ReportsPanel";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import type {
  CampaignRow,
  CustomerRow,
  MeasurementRow,
  ProductRow,
  ReportsData,
  StaffRow,
  StatsData,
  TabKey,
  UdhaarRow,
} from "@/types/crm";

export function OwnerDashboard() {
  const { showToast } = useToast();
  const modulesSectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("Leads");

  const jumpToTab = (tab: TabKey) => {
    setActiveTab(tab);
    modulesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const [leadSummary, setLeadSummary] = useState({
    todayLeads: 4,
    pendingFollowups: 4,
    monthlyLeads: 44,
    monthlyPakki: 15,
    bestSource: "Instagram DM",
  });

  const [stats, setStats] = useState<StatsData>({
    aajKiSale: 45000,
    isMahineKiSale: 450000,
    totalCustomers: 1200,
    nayeCustomer: 85,
    topSellingItem: "Red Kurti",
    udhaarBaki: 20000,
    lowStockCount: 12,
    aajCustomerAaye: 18,
    alerts: [],
  });

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [staffList, setStaffList] = useState<StaffRow[]>([]);
  const [udhaars, setUdhaars] = useState<UdhaarRow[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [reports, setReports] = useState<ReportsData | null>(null);

  // Stock Filter & Price Edit
  const [stockCategory, setStockCategory] = useState("All");
  const [editPriceProduct, setEditPriceProduct] = useState<ProductRow | null>(null);
  const [newPriceValue, setNewPriceValue] = useState("");

  // Customer Search & Filter
  const [customerFilter, setCustomerFilter] = useState<"All" | "VIP" | "Inactive">("All");
  const [customerQuery, setCustomerQuery] = useState("");

  // Customer Edit & History
  const [editCustomer, setEditCustomer] = useState<CustomerRow | null>(null);
  const [custHistoryOpen, setCustHistoryOpen] = useState(false);
  const [custHistoryBills, setCustHistoryBills] = useState<
    { id: string; bill_no: number; final_total: number; payment_method: string; createdAt: string; items: { qty: number; size: string; product: { name: string } }[] }[]
  >([]);

  // Marketing State
  const [marketingTemplate, setMarketingTemplate] = useState(
    "Namaste Didi! Priya Boutique Nathdwara me Diwali New Stock aa gaya hai. VIP customers ke liye 20% OFF — aaj hi padharein!"
  );
  const [marketingTitle, setMarketingTitle] = useState("Diwali Offer");
  const [lastSentCount, setLastSentCount] = useState(500);

  // Modals
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    category: "Kurti",
    price: "",
    size: "M",
    quantity: "5",
    photo_url: "",
  });

  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "STAFF",
    target_monthly: "100000",
    commission_percent: "2",
  });

  const [addUdhaarOpen, setAddUdhaarOpen] = useState(false);
  const [udhaarForm, setUdhaarForm] = useState({
    customer_id: "",
    amount: "",
    due_date: "",
  });

  const [addMeasOpen, setAddMeasOpen] = useState(false);
  const [measForm, setMeasForm] = useState({
    customer_id: "",
    blouse: "34",
    sleeve: "10",
    length: "14.5",
    waist: "28",
    shoulder: "14",
    delivery_date: "",
  });
  const [printMeas, setPrintMeas] = useState<MeasurementRow | null>(null);

  // Settings
  const [shopProfile, setShopProfile] = useState({
    name: "Priya Boutique",
    address: "Bada Bazar, Nathdwara, Rajasthan 313301",
    phone: "9829012345",
    tagline: "Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi",
  });

  const loadAll = useCallback(async () => {
    try {
      const [
        statsRes,
        custRes,
        prodRes,
        staffRes,
        udhRes,
        measRes,
        campRes,
        repRes,
        setRes,
      ] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/staff"),
        fetch("/api/udhaar"),
        fetch("/api/measurements"),
        fetch("/api/marketing/send"),
        fetch("/api/reports"),
        fetch("/api/settings"),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats((prev) => ({ ...prev, ...d }));
      }
      if (custRes.ok) {
        const d = await custRes.json();
        const list = d.customers || [];
        setCustomers(list);
        if (list.length > 0) {
          setMeasForm((f) => (f.customer_id ? f : { ...f, customer_id: list[0].id }));
          setUdhaarForm((f) => (f.customer_id ? f : { ...f, customer_id: list[0].id }));
        }
      }
      if (prodRes.ok) setProducts((await prodRes.json()).products || []);
      if (staffRes.ok) setStaffList((await staffRes.json()).staff || []);
      if (udhRes.ok) setUdhaars((await udhRes.json()).udhaars || []);
      if (measRes.ok) setMeasurements((await measRes.json()).measurements || []);
      if (campRes.ok) setCampaigns((await campRes.json()).campaigns || []);
      if (repRes.ok) setReports(await repRes.json());
      if (setRes.ok) {
        const s = await setRes.json();
        if (s.shopProfile) setShopProfile(s.shopProfile);
        // Save automatic localStorage backup
        try {
          localStorage.setItem("priya_boutique_backup", JSON.stringify(s.backup));
        } catch {
          // ignore storage quota errors
        }
      }
    } catch {
      showToast("Dashboard data load karne me error.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredProducts = useMemo(() => {
    if (stockCategory === "All") return products;
    return products.filter((p) => p.category === stockCategory);
  }, [products, stockCategory]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (customerFilter === "VIP" && !c.is_vip) return false;
      if (customerFilter === "Inactive" && !c.is_inactive) return false;
      const q = customerQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    });
  }, [customers, customerFilter, customerQuery]);

  const handleAddStock = async (productId: string, size: string) => {
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, size, addQuantity: 5 }),
    });
    if (res.ok) {
      showToast(`+5 Piece (${size}) Stock Add Ho Gaya!`);
      loadAll();
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPriceProduct) return;
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: editPriceProduct.id,
        price: Number(newPriceValue),
      }),
    });
    if (res.ok) {
      showToast("Price Update Ho Gaya!");
      setEditPriceProduct(null);
      loadAll();
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productForm),
    });
    if (res.ok) {
      showToast("Naya Kapda Stock Me Add Ho Gaya!");
      setAddProductOpen(false);
      setProductForm({
        name: "",
        category: "Kurti",
        price: "",
        size: "M",
        quantity: "5",
        photo_url: "",
      });
      loadAll();
    }
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    const res = await fetch("/api/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editCustomer),
    });
    if (res.ok) {
      showToast("Customer Details Update Ho Gayi!");
      setEditCustomer(null);
      loadAll();
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    const res = await fetch(`/api/customers?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`${name} delete ho gaya.`);
      loadAll();
    }
  };

  const handleViewCustomerHistory = async (customerId: string) => {
    const res = await fetch(`/api/bills?customerId=${customerId}`);
    if (res.ok) {
      const data = await res.json();
      setCustHistoryBills(data.bills || []);
      setCustHistoryOpen(true);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(staffForm),
    });
    if (res.ok) {
      showToast("Naya Staff Add Ho Gaya!");
      setAddStaffOpen(false);
      setStaffForm({
        name: "",
        phone: "",
        email: "",
        role: "STAFF",
        target_monthly: "100000",
        commission_percent: "2",
      });
      loadAll();
    }
  };

  const handleAttendance = async (
    id: string,
    attendance: "Present" | "Absent" | "Half Day"
  ) => {
    const res = await fetch("/api/staff", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, attendance }),
    });
    if (res.ok) {
      showToast(`Attendance Marked: ${attendance}`);
      loadAll();
    }
  };

  const handleCreateUdhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/udhaar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(udhaarForm),
    });
    if (res.ok) {
      showToast("Udhaar Entry Save Ho Gayi!");
      setAddUdhaarOpen(false);
      setUdhaarForm((f) => ({ ...f, amount: "", due_date: "" }));
      loadAll();
    }
  };

  const handleUdhaarReminder = async (id: string) => {
    const res = await fetch(`/api/udhaar/${id}/reminder`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      showToast("WhatsApp Reminder Bhej Diya!");
      if (data.waLink) window.open(data.waLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleMarkPaid = async (id: string) => {
    const res = await fetch(`/api/udhaar/${id}/mark-paid`, { method: "POST" });
    if (res.ok) {
      showToast("Udhaar Paid Mark Ho Gaya!");
      loadAll();
    }
  };

  const handleSendCampaign = async (title: string, template: string) => {
    const res = await fetch("/api/marketing/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, template }),
    });
    const data = await res.json();
    if (res.ok) {
      setLastSentCount(data.sent_to_count || 500);
      showToast(`Offer Bhej Diya! (${data.sent_to_count || 500} Customers)`);
      loadAll();
      if (data.waLink) window.open(data.waLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleCreateMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/measurements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(measForm),
    });
    if (res.ok) {
      showToast("Measurement Save Ho Gaya!");
      setAddMeasOpen(false);
      loadAll();
    }
  };

  const handleMeasurementStatus = async (id: string, status: string) => {
    const res = await fetch("/api/measurements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      showToast(`Status Updated: ${status}`);
      loadAll();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shopProfile),
    });
    if (res.ok) {
      showToast("Shop Profile Save Ho Gaya!");
    }
  };

  const handleDownloadBackup = () => {
    const data = localStorage.getItem("priya_boutique_backup") || JSON.stringify({
      customers,
      products,
      udhaars,
      measurements,
      staffList,
    });
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `priya-boutique-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Data Backup Download Ho Gaya!");
  };

  const tabs: { key: TabKey; icon: React.ReactNode }[] = [
    { key: "Leads", icon: <CssDiamondIcon /> },
    { key: "Pipeline", icon: <CssGridIcon /> },
    { key: "Follow-ups", icon: <CssBellIcon /> },
    { key: "Customers", icon: <CssUserIcon /> },
    { key: "Omnichannel", icon: <CssBagIcon /> },
    { key: "Inbox", icon: <CssChatIcon /> },
    { key: "Stock", icon: <CssBagIcon /> },
    { key: "Staff", icon: <CssUserIcon /> },
    { key: "Marketing", icon: <CssDiamondIcon /> },
    { key: "Udhaar", icon: <CssDocIcon /> },
    { key: "Measurement", icon: <CssDocIcon /> },
    { key: "Reports", icon: <CssChartIcon /> },
    { key: "Integrations", icon: <CssGearIcon /> },
    { key: "Settings", icon: <CssGearIcon /> },
  ];

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-16 pt-4">
      {/* Executive Showroom Banner */}
      <section className="mb-6 rounded-[28px] bg-white/85 backdrop-blur-md p-5 sm:p-6 shadow-boutique border border-gold/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-softpink px-3.5 py-1 text-[11px] font-bold text-maroon border border-gold/40 mb-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Aaj {stats.aajCustomerAaye} Customer Aaye</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-maroon tracking-tight">
            {shopProfile.name} — Owner Command Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-charcoal/75">
            &ldquo;{shopProfile.tagline}&rdquo;
          </p>
        </div>

        {/* Quick-Action & Module Jump Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <BoutiqueButton
            variant={activeTab === "Leads" ? "primary" : "outline"}
            onClick={() => jumpToTab("Leads")}
            className="py-1.5 px-3.5 text-xs"
          >
            <CssDiamondIcon />
            <span>Leads</span>
          </BoutiqueButton>
          <BoutiqueButton
            variant={activeTab === "Pipeline" ? "primary" : "outline"}
            onClick={() => jumpToTab("Pipeline")}
            className="py-1.5 px-3.5 text-xs"
          >
            <CssGridIcon />
            <span>Pipeline</span>
          </BoutiqueButton>
          <BoutiqueButton
            variant="outline"
            onClick={() => setAddProductOpen(true)}
            className="py-1.5 px-3.5 text-xs"
          >
            <CssPlusIcon />
            <span>Add Kapda</span>
          </BoutiqueButton>
          <BoutiqueButton
            variant="outline"
            onClick={() => setAddUdhaarOpen(true)}
            className="py-1.5 px-3.5 text-xs"
          >
            <CssPlusIcon />
            <span>Add Udhaar</span>
          </BoutiqueButton>
          <BoutiqueButton
            variant="gold"
            onClick={() => setAddMeasOpen(true)}
            className="py-1.5 px-3.5 text-xs"
          >
            <CssPlusIcon />
            <span>Measurement</span>
          </BoutiqueButton>
        </div>
      </section>

      {/* Bento Dashboard Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 mb-6">
        <BoutiqueCard
          className="lg:col-span-4 bg-gradient-to-br from-maroon to-maroon-light text-white border-gold/50"
          delay={0.05}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gold-soft font-semibold">
              Aaj Ki Sale
            </span>
            <CssChartIcon className="text-gold-shine" />
          </div>
          <p className="mt-3 font-serif text-4xl font-extrabold">
            <CountUpNumber value={stats.aajKiSale} prefix="₹" />
          </p>
          <div className="mt-3 space-y-1.5">
            <div className="flex justify-between text-[11px] text-gold-soft/90">
              <span>Daily Goal: ₹50,000</span>
              <span>{Math.min(100, Math.round((stats.aajKiSale / 50000) * 100))}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(100, Math.round((stats.aajKiSale / 50000) * 100))}%`,
                }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold-shine"
              />
            </div>
          </div>
          <p className="mt-2.5 text-xs text-gold-soft/90">
            Top Selling: <strong>{stats.topSellingItem}</strong> • COD/Prepaid: <strong>25% / 75%</strong>
          </p>
        </BoutiqueCard>

        <BoutiqueCard className="lg:col-span-3" delay={0.1}>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Is Mahine Ki Sale
          </span>
          <p className="mt-3 font-serif text-3xl font-extrabold text-maroon">
            <CountUpNumber value={stats.isMahineKiSale} prefix="₹" />
          </p>
          <p className="mt-2 text-xs text-charcoal/65">Monthly Showroom Total</p>
        </BoutiqueCard>

        <BoutiqueCard className="lg:col-span-2" delay={0.15}>
          <span className="text-xs uppercase tracking-widest text-gold font-bold">
            Customers
          </span>
          <p className="mt-3 font-serif text-3xl font-extrabold text-maroon">
            <CountUpNumber value={stats.totalCustomers} />
          </p>
          <p className="mt-2 text-xs font-semibold text-green-700">
            +<CountUpNumber value={stats.nayeCustomer} /> Naye Is Mahine
          </p>
        </BoutiqueCard>

        <BoutiqueCard className="lg:col-span-3" delay={0.2}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-maroon font-bold">
              Udhaar & Low Stock
            </span>
            <CssAlertIcon className="text-red-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <p className="font-serif text-2xl font-extrabold text-red-600">
              <CountUpNumber value={stats.udhaarBaki} prefix="₹" />
            </p>
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              <CountUpNumber value={stats.lowStockCount} /> Low Stock
            </span>
          </div>
          <p className="mt-2 text-xs text-charcoal/65">
            Time pe vasooli & stock refill
          </p>
        </BoutiqueCard>
      </section>

      {/* Command Center Lead Summary Strip ("EK SCREEN") */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <BoutiqueCard className="p-4">
          <span className="text-[11px] font-bold uppercase text-gold">
            Aaj Ki Leads
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-extrabold text-maroon mt-1">
            <CountUpNumber value={leadSummary.todayLeads} />
          </p>
        </BoutiqueCard>
        <BoutiqueCard className="p-4">
          <span className="text-[11px] font-bold uppercase text-red-600">
            Follow-up Pending Aaj
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">
            <CountUpNumber value={leadSummary.pendingFollowups} />
          </p>
        </BoutiqueCard>
        <BoutiqueCard className="p-4">
          <span className="text-[11px] font-bold uppercase text-gold">
            Mahine Leads → PAKKI
          </span>
          <p className="font-serif text-2xl sm:text-3xl font-extrabold text-maroon mt-1">
            {leadSummary.monthlyLeads} → {leadSummary.monthlyPakki}
          </p>
        </BoutiqueCard>
        <BoutiqueCard className="p-4">
          <span className="text-[11px] font-bold uppercase text-gold">
            Best Source
          </span>
          <p className="font-serif text-xl sm:text-2xl font-extrabold text-maroon mt-1 truncate">
            {leadSummary.bestSource}
          </p>
        </BoutiqueCard>
      </section>

      {/* Sales Funnel Conversion & Source Performance Strip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <BoutiqueCard className="lg:col-span-7 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-base sm:text-lg font-bold text-maroon">
              Sales Funnel Conversion
            </h2>
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-[11px] font-bold text-green-700">
              34% Close Rate
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {[
              { stage: "NEW", count: 44, pct: 100, color: "from-maroon/70 to-maroon" },
              { stage: "BAAT HUI", count: 32, pct: 72, color: "from-maroon to-maroon-light" },
              { stage: "QUOTE", count: 21, pct: 48, color: "from-gold to-gold-shine" },
              { stage: "PAKKI", count: 15, pct: 34, color: "from-green-600 to-green-500" },
            ].map((step) => (
              <div key={step.stage} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-charcoal">
                  <span>{step.stage}</span>
                  <span>{step.pct}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-ivory overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${step.pct}%` }}
                    transition={{ duration: 0.9 }}
                    className={`h-full rounded-full bg-gradient-to-r ${step.color}`}
                  />
                </div>
                <p className="text-[10px] text-charcoal/65">{step.count} Leads</p>
              </div>
            ))}
          </div>
        </BoutiqueCard>

        <BoutiqueCard className="lg:col-span-5 p-4 sm:p-5">
          <h2 className="font-serif text-base sm:text-lg font-bold text-maroon mb-3">
            Lead Source Breakdown
          </h2>
          <div className="space-y-2">
            {[
              { name: "Instagram DM", pct: 44 },
              { name: "WhatsApp", pct: 28 },
              { name: "Walk-in / Call", pct: 18 },
              { name: "Website", pct: 10 },
            ].map((src) => (
              <div key={src.name} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate font-semibold text-charcoal">
                  {src.name}
                </span>
                <div className="flex-1 h-2 rounded-full bg-ivory overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${src.pct}%` }}
                    transition={{ duration: 0.85 }}
                    className="h-full rounded-full bg-gradient-to-r from-maroon to-gold-shine"
                  />
                </div>
                <span className="w-8 text-right font-bold text-maroon">
                  {src.pct}%
                </span>
              </div>
            ))}
          </div>
        </BoutiqueCard>
      </section>

      {/* Smart Alerts Strip */}
      {stats.alerts.length > 0 && (
        <BoutiqueCard className="mb-6 bg-softpink/70 border-gold/45">
          <div className="flex items-center gap-2 mb-3">
            <CssBellIcon className="text-maroon" />
            <h2 className="font-serif text-lg font-bold text-maroon">
              Aaj Ke Smart Alerts
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.alerts.slice(0, 8).map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between gap-2 rounded-2xl bg-white p-3.5 border border-gold/35 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {alert.type === "birthday" && (
                    <CssCrownIcon className="shrink-0 text-gold" />
                  )}
                  {alert.type === "inactive" && (
                    <CssPhoneIcon className="shrink-0 text-red-600" />
                  )}
                  {alert.type === "low_stock" && (
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600 animate-ping" />
                  )}
                  <span className="text-xs font-semibold text-charcoal">
                    {alert.title}
                  </span>
                </div>

                {alert.type === "birthday" && alert.phone && (
                  <a
                    href={buildWhatsAppLink(
                      alert.phone,
                      `Namaste ${alert.customerName} ji! Priya Boutique Nathdwara ki taraf se aapko khaas message.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-green-700"
                  >
                    {alert.actionLabel}
                  </a>
                )}

                {alert.type === "inactive" && alert.phone && (
                  <a
                    href={`tel:${alert.phone}`}
                    className="shrink-0 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700"
                  >
                    {alert.actionLabel}
                  </a>
                )}

                {alert.type === "low_stock" && (
                  <button
                    type="button"
                    onClick={() => setActiveTab("Stock")}
                    className="shrink-0 rounded-full bg-maroon px-2.5 py-1 text-[11px] font-bold text-white"
                  >
                    {alert.actionLabel}
                  </button>
                )}
              </div>
            ))}
          </div>
        </BoutiqueCard>
      )}

      <div ref={modulesSectionRef} className="scroll-mt-24">
        <GoldDivider label="Showroom Command Center" />
      </div>

      {/* Sidebar + Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <DashboardSidebar
          tabs={tabs}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />

        {/* Main Content Area */}
        <div className="w-full flex-1 min-w-0">
          {/* Tab Content */}
          <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
        >
          {/* TAB 1: CUSTOMERS */}
          {activeTab === "Customers" && (
            <BoutiqueCard>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-maroon">
                  Customer Directory ({filteredCustomers.length})
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Naam ya Phone..."
                    className="rounded-full border border-gold/40 bg-ivory px-3.5 py-1.5 text-xs outline-none focus:border-maroon"
                  />
                  {(["All", "VIP", "Inactive"] as const).map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() => setCustomerFilter(seg)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                        customerFilter === seg
                          ? "bg-maroon text-white border-maroon"
                          : "bg-ivory text-charcoal border-gold/35"
                      }`}
                    >
                      {seg}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                      <th className="py-3 px-3">Name & Size</th>
                      <th className="py-3 px-3">Phone</th>
                      <th className="py-3 px-3">Total Kharida</th>
                      <th className="py-3 px-3">Pasand / Last Item</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-ivory/80">
                        <td className="py-3 px-3">
                          <p className="font-semibold">{c.name}</p>
                          <p className="text-xs text-charcoal/65">
                            Size: {c.size} • {c.city}
                          </p>
                        </td>
                        <td className="py-3 px-3">{c.phone}</td>
                        <td className="py-3 px-3 font-bold text-maroon">
                          {formatINR(c.total_kharida)}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          <p className="font-medium">{c.lastItem}</p>
                          <p className="text-charcoal/60 truncate max-w-[160px]">
                            {c.pasand}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1.5">
                            {c.is_vip && <VipBadge />}
                            {c.is_inactive && (
                              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                                90+ Din Inactive
                              </span>
                            )}
                            {!c.is_vip && !c.is_inactive && (
                              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                                Active
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleViewCustomerHistory(c.id)}
                              title="Purchase History"
                              className="rounded-full bg-ivory p-1.5 text-maroon border border-gold/40 hover:bg-softpink inline-flex items-center"
                            >
                              <CssDocIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditCustomer(c)}
                              title="Edit Customer"
                              className="rounded-full bg-ivory p-1.5 text-maroon border border-gold/40 hover:bg-softpink inline-flex items-center"
                            >
                              <CssEditIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomer(c.id, c.name)}
                              title="Delete Customer"
                              className="rounded-full bg-red-50 p-1.5 text-red-600 border border-red-200 hover:bg-red-100 inline-flex items-center"
                            >
                              <CssTrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BoutiqueCard>
          )}

          {/* TAB: LEADS */}
          {activeTab === "Leads" && (
            <LeadsWorkspace mode="leads" onSummaryChange={setLeadSummary} />
          )}

          {/* TAB: KANBAN PIPELINE */}
          {activeTab === "Pipeline" && (
            <LeadsWorkspace mode="pipeline" onSummaryChange={setLeadSummary} />
          )}

          {/* TAB: FOLLOW-UPS */}
          {activeTab === "Follow-ups" && (
            <LeadsWorkspace mode="followups" onSummaryChange={setLeadSummary} />
          )}

          {/* TAB: OMNICHANNEL ORDERS & RTO */}
          {activeTab === "Omnichannel" && <OmnichannelOrdersTab />}

          {/* TAB: UNIFIED SUPPORT INBOX */}
          {activeTab === "Inbox" && <UnifiedInboxTab />}

          {/* TAB: INTEGRATIONS */}
          {activeTab === "Integrations" && <IntegrationsTab />}

          {/* TAB 2: STOCK */}
          {activeTab === "Stock" && (
            <BoutiqueCard>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-maroon">
                  Inventory, Category Filter & Price Edit
                </h3>
                <BoutiqueButton onClick={() => setAddProductOpen(true)}>
                  <CssPlusIcon />
                  <span>Naya Kapda Add Karein</span>
                </BoutiqueButton>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {["All", "Kurti", "Saree", "Lehenga", "Suit", "Gown"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStockCategory(cat)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold border transition-all ${
                      stockCategory === cat
                        ? "bg-maroon text-white border-maroon"
                        : "bg-ivory text-charcoal border-gold/35 hover:border-maroon"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                      <th className="py-3 px-3">Photo</th>
                      <th className="py-3 px-3">Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Sizes & Stock</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {filteredProducts.map((p) => {
                      const hasLow = p.stocks.some(
                        (s) => s.quantity < s.low_stock_threshold
                      );
                      return (
                        <tr
                          key={p.id}
                          className={
                            hasLow
                              ? "bg-red-50/70 animate-row-shake"
                              : "hover:bg-ivory/80"
                          }
                        >
                          <td className="py-3 px-3">
                            <img
                              src={p.photo_url}
                              alt={p.name}
                              className="h-12 w-12 rounded-xl object-cover border border-gold/30"
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold">{p.name}</td>
                          <td className="py-3 px-3">{p.category}</td>
                          <td className="py-3 px-3 font-bold text-maroon">
                            <div className="flex items-center gap-1.5">
                              <span>{formatINR(p.price)}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditPriceProduct(p);
                                  setNewPriceValue(String(p.price));
                                }}
                                title="Edit Price"
                                className="rounded-full p-1 text-gold hover:bg-ivory"
                              >
                                <CssEditIcon />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1.5">
                              {p.stocks.map((s) => {
                                const out = s.quantity === 0;
                                const low = s.quantity < s.low_stock_threshold;
                                return (
                                  <span
                                    key={s.id}
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      out
                                        ? "bg-charcoal text-white"
                                        : low
                                        ? "bg-red-600 text-white"
                                        : "bg-ivory text-charcoal border border-gold/35"
                                    }`}
                                  >
                                    {low && !out && (
                                      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                                    )}
                                    {s.size}: {out ? "Out Of Stock" : s.quantity}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <BoutiqueButton
                              variant="outline"
                              onClick={() =>
                                handleAddStock(
                                  p.id,
                                  p.stocks.find(
                                    (s) => s.quantity < s.low_stock_threshold
                                  )?.size ||
                                    p.stocks[0]?.size ||
                                    "M"
                                )
                              }
                              className="px-3 py-1.5 text-xs"
                            >
                              + Add Stock
                            </BoutiqueButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </BoutiqueCard>
          )}

          {/* TAB 3: STAFF (Add Staff + Attendance + Animated Target Bar) */}
          {activeTab === "Staff" && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <BoutiqueButton onClick={() => setAddStaffOpen(true)}>
                  <CssUserIcon />
                  <span>Naya Staff Add Karein</span>
                </BoutiqueButton>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staffList.map((st, idx) => {
                  const pct =
                    st.name === "Raju" && st.current_sale === 28000
                      ? 78
                      : Math.min(
                          100,
                          Math.round(
                            (st.current_sale / Math.max(1, st.target_monthly)) *
                              100
                          )
                        );
                  const commissionEarned = Math.round(
                    (st.current_sale * st.commission_percent) / 100
                  );

                  return (
                    <BoutiqueCard key={st.id} delay={idx * 0.08}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-serif text-xl font-bold text-maroon">
                            {st.name}
                          </h4>
                          <p className="text-xs text-charcoal/70">
                            {st.role} • {st.phone}
                          </p>
                        </div>
                        <span className="rounded-full bg-softpink px-3 py-1 text-xs font-bold text-maroon border border-gold/30">
                          Commission {st.commission_percent}%
                        </span>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>Sale: {formatINR(st.current_sale)}</span>
                          <span>Target: {formatINR(st.target_monthly)}</span>
                        </div>

                        <div className="h-3.5 w-full rounded-full bg-ivory border border-gold/30 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-maroon via-maroon-light to-gold-shine"
                          />
                        </div>

                        <div className="flex justify-between text-xs pt-1">
                          <span className="font-bold text-maroon">
                            Progress: {pct}%
                          </span>
                          <span className="font-semibold text-green-700">
                            Kamai: {formatINR(commissionEarned)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gold/25 flex items-center justify-between">
                        <span className="text-xs font-semibold text-charcoal/75">
                          Attendance:
                        </span>
                        <select
                          value={st.attendance || "Present"}
                          onChange={(e) =>
                            handleAttendance(
                              st.id,
                              e.target.value as "Present" | "Absent" | "Half Day"
                            )
                          }
                          className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs font-semibold text-maroon outline-none"
                        >
                          <option value="Present">Present ✓</option>
                          <option value="Half Day">Half Day</option>
                          <option value="Absent">Absent ✗</option>
                        </select>
                      </div>
                    </BoutiqueCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: MARKETING */}
          {activeTab === "Marketing" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <BoutiqueCard className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl font-bold text-maroon">
                      1-Click Festival & Offer WhatsApp
                    </h3>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      Sent to {lastSentCount} Customers
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <BoutiqueButton
                      onClick={() => {
                        const t =
                          "Namaste Didi! Priya Boutique Nathdwara me Diwali New Stock aa gaya hai. VIP customers ke liye 20% OFF!";
                        setMarketingTitle("Diwali Offer");
                        setMarketingTemplate(t);
                        handleSendCampaign("Diwali Offer", t);
                      }}
                    >
                      <CssDiamondIcon />
                      <span>Diwali Offer Bhejo</span>
                    </BoutiqueButton>

                    <BoutiqueButton
                      variant="gold"
                      onClick={() => {
                        const t =
                          "Happy Birthday Didi! Priya Boutique Nathdwara ki taraf se aapko khaas 20% Birthday Gift OFF!";
                        setMarketingTitle("Birthday Offer");
                        setMarketingTemplate(t);
                        handleSendCampaign("Birthday Offer", t);
                      }}
                    >
                      <CssCrownIcon />
                      <span>Birthday Offer Bhejo</span>
                    </BoutiqueButton>

                    <BoutiqueButton
                      variant="outline"
                      onClick={() => {
                        const t =
                          "Naya Stock Aa Gaya Hai, Aao! Priya Boutique Nathdwara me Bridal Lehenga aur Kurti ka fresh collection aaya hai.";
                        setMarketingTitle("New Stock Alert");
                        setMarketingTemplate(t);
                        handleSendCampaign("New Stock Alert", t);
                      }}
                    >
                      <span>New Stock Alert</span>
                    </BoutiqueButton>

                    <BoutiqueButton
                      variant="outline"
                      onClick={() => {
                        const t =
                          "Aapko Yaad Kar Rahe Hain! Priya Boutique Nathdwara me aapke liye 20% OFF welcome back offer hai.";
                        setMarketingTitle("Inactive Customer Offer");
                        setMarketingTemplate(t);
                        handleSendCampaign("Inactive Customer Offer", t);
                      }}
                    >
                      <span>Inactive Offer</span>
                    </BoutiqueButton>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-maroon mb-1.5">
                      Message Template ({marketingTitle})
                    </label>
                    <textarea
                      rows={4}
                      value={marketingTemplate}
                      onChange={(e) => setMarketingTemplate(e.target.value)}
                      className="w-full rounded-2xl border border-gold/40 bg-ivory/75 p-3.5 text-sm outline-none focus:border-maroon"
                    />
                  </div>

                  <WhatsAppButton
                    label="Send to 500 Customers"
                    onClick={() =>
                      handleSendCampaign(marketingTitle, marketingTemplate)
                    }
                  />
                </BoutiqueCard>

                {/* Phone Mockup Preview */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="w-full max-w-[300px] rounded-[36px] bg-charcoal p-3 shadow-boutique-hover border-4 border-gold/60">
                    <div className="rounded-[28px] bg-[#ECE5DD] overflow-hidden">
                      <div className="bg-[#075E54] text-white px-4 py-3 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gold-shine flex items-center justify-center font-serif font-bold text-maroon text-sm">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-bold">
                            {shopProfile.name} Nathdwara
                          </p>
                          <p className="text-[10px] text-green-200">
                            WhatsApp Business • Verified
                          </p>
                        </div>
                      </div>
                      <div className="p-4 min-h-[220px] flex flex-col justify-end">
                        <div className="rounded-2xl rounded-tl-none bg-white p-3 text-xs text-charcoal shadow-sm">
                          <p className="font-bold text-maroon mb-1">
                            ✨ {marketingTitle}
                          </p>
                          <p className="leading-relaxed">{marketingTemplate}</p>
                          <p className="text-[10px] text-right text-gray-400 mt-1.5">
                            10:30 AM ✓✓
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message History */}
              <BoutiqueCard>
                <h4 className="font-serif text-lg font-bold text-maroon mb-3">
                  Message History
                </h4>
                <div className="space-y-2">
                  {campaigns.map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-ivory/70 p-3 border border-gold/30 text-xs"
                    >
                      <div>
                        <p className="font-bold text-maroon">{c.title}</p>
                        <p className="text-charcoal/75">{c.template}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 font-bold text-green-700">
                        Sent to {c.sent_to_count} •{" "}
                        {new Date(c.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </BoutiqueCard>
            </div>
          )}

          {/* TAB 5: UDHAAR */}
          {activeTab === "Udhaar" && (
            <BoutiqueCard>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-maroon">
                  Udhaar Vasooli Register
                </h3>
                <BoutiqueButton onClick={() => setAddUdhaarOpen(true)}>
                  <CssPlusIcon />
                  <span>Naya Udhaar Add Karein</span>
                </BoutiqueButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Due Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {udhaars.map((u) => (
                      <tr key={u.id} className="hover:bg-ivory/80">
                        <td className="py-3 px-3">
                          <p className="font-semibold">{u.customer.name}</p>
                          <p className="text-xs text-charcoal/65">
                            {u.customer.phone}
                          </p>
                        </td>
                        <td className="py-3 px-3 font-bold text-maroon">
                          {formatINR(u.amount)}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          {new Date(u.due_date).toLocaleDateString("en-IN")}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                              u.status === "Paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {u.status === "Pending" ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <WhatsAppButton
                                label="Reminder Bhejo"
                                onClick={() => handleUdhaarReminder(u.id)}
                                className="px-3.5 py-1.5 text-xs"
                              />
                              <BoutiqueButton
                                variant="outline"
                                onClick={() => handleMarkPaid(u.id)}
                                className="px-3 py-1.5 text-xs"
                              >
                                <CssCheckIcon />
                                <span>Mark Paid</span>
                              </BoutiqueButton>
                            </div>
                          ) : (
                            <span className="text-xs text-green-700 font-semibold">
                              Vasool Ho Gaya ✓
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BoutiqueCard>
          )}

          {/* TAB 6: MEASUREMENT */}
          {activeTab === "Measurement" && (
            <BoutiqueCard>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="font-serif text-xl font-bold text-maroon">
                  Silai & Measurement Diary
                </h3>
                <BoutiqueButton onClick={() => setAddMeasOpen(true)}>
                  <CssPlusIcon />
                  <span>Naya Measurement</span>
                </BoutiqueButton>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">Blouse / Sleeve / Length</th>
                      <th className="py-3 px-3">Waist / Shoulder</th>
                      <th className="py-3 px-3">Delivery Date</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/20">
                    {measurements.map((m) => (
                      <tr key={m.id} className="hover:bg-ivory/80">
                        <td className="py-3 px-3 font-semibold">
                          {m.customer.name}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          Blouse: {m.blouse}&rdquo; • Sleeve: {m.sleeve}&rdquo; •
                          Length: {m.length}&rdquo;
                        </td>
                        <td className="py-3 px-3 text-xs">
                          Waist: {m.waist}&rdquo; • Shoulder: {m.shoulder}&rdquo;
                        </td>
                        <td className="py-3 px-3 text-xs">
                          {m.delivery_date
                            ? new Date(m.delivery_date).toLocaleDateString(
                                "en-IN"
                              )
                            : "-"}
                        </td>
                        <td className="py-3 px-3">
                          <select
                            value={m.status}
                            onChange={(e) =>
                              handleMeasurementStatus(m.id, e.target.value)
                            }
                            className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs font-semibold text-maroon outline-none"
                          >
                            {[
                              "Measurement Liya",
                              "Sil Raha Hai",
                              "Ready Hai",
                              "De Diya",
                            ].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => setPrintMeas(m)}
                            className="inline-flex items-center gap-1 rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-maroon border border-gold/40 hover:bg-softpink"
                          >
                            <CssDocIcon />
                            <span>Tailor Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BoutiqueCard>
          )}

          {/* TAB 7: REPORTS */}
          {activeTab === "Reports" && reports && (
            <ReportsPanel reports={reports} />
          )}

          {/* TAB 8: SETTINGS & BACKUP */}
          {activeTab === "Settings" && (
            <SettingsPanel
              shopProfile={shopProfile}
              onChangeProfile={setShopProfile}
              onSaveProfile={handleSaveSettings}
              onDownloadBackup={handleDownloadBackup}
            />
          )}
        </motion.div>
      </AnimatePresence>
        </div>
      </div>

      {/* Edit Price Modal */}
      <BoutiqueModal
        open={!!editPriceProduct}
        onClose={() => setEditPriceProduct(null)}
        title={`Price Edit — ${editPriceProduct?.name || ""}`}
      >
        <form onSubmit={handleSavePrice} className="space-y-3">
          <input
            type="number"
            required
            value={newPriceValue}
            onChange={(e) => setNewPriceValue(e.target.value)}
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit" className="w-full">
            Update Price
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Edit Customer Modal */}
      <BoutiqueModal
        open={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        title="Customer Details Edit Karein"
      >
        {editCustomer && (
          <form onSubmit={handleUpdateCustomer} className="space-y-3">
            <input
              type="text"
              required
              value={editCustomer.name}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, name: e.target.value })
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
            <input
              type="tel"
              required
              value={editCustomer.phone}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, phone: e.target.value })
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
            <input
              type="text"
              value={editCustomer.pasand}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, pasand: e.target.value })
              }
              placeholder="Pasand"
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
            <BoutiqueButton type="submit" className="w-full">
              Save Changes
            </BoutiqueButton>
          </form>
        )}
      </BoutiqueModal>

      {/* Customer History Modal */}
      <BoutiqueModal
        open={custHistoryOpen}
        onClose={() => setCustHistoryOpen(false)}
        title="Customer Purchase History"
      >
        <div className="space-y-2.5 max-h-[55vh] overflow-y-auto">
          {custHistoryBills.length === 0 ? (
            <p className="text-sm text-center text-charcoal/65 py-4">
              Abhi koi bill history nahi hai.
            </p>
          ) : (
            custHistoryBills.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl bg-white p-3 border border-gold/35 text-xs"
              >
                <div className="flex justify-between font-bold text-maroon">
                  <span>Bill #{b.bill_no}</span>
                  <span>{formatINR(b.final_total)}</span>
                </div>
                <p className="text-charcoal/70 mt-1">
                  {b.items?.map((i) => `${i.product?.name} (${i.size}×${i.qty})`).join(", ")}
                </p>
              </div>
            ))
          )}
        </div>
      </BoutiqueModal>

      {/* Add Product Modal */}
      <BoutiqueModal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        title="Naya Kapda Stock Me Jodein"
      >
        <form onSubmit={handleCreateProduct} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Kapde ka Naam (e.g. Yellow Kurti)"
            value={productForm.name}
            onChange={(e) =>
              setProductForm((f) => ({ ...f, name: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={productForm.category}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            >
              {["Kurti", "Saree", "Lehenga", "Suit", "Gown"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              required
              placeholder="Price (₹)"
              value={productForm.price}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, price: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={productForm.size}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, size: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            >
              {["S", "M", "L", "XL", "XXL"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              required
              placeholder="Quantity"
              value={productForm.quantity}
              onChange={(e) =>
                setProductForm((f) => ({ ...f, quantity: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
          </div>
          <input
            type="url"
            placeholder="Photo URL (Optional)"
            value={productForm.photo_url}
            onChange={(e) =>
              setProductForm((f) => ({ ...f, photo_url: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit" className="w-full">
            Save Product
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Add Staff Modal */}
      <BoutiqueModal
        open={addStaffOpen}
        onClose={() => setAddStaffOpen(false)}
        title="Naya Staff Add Karein"
      >
        <form onSubmit={handleCreateStaff} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Staff Name"
            value={staffForm.name}
            onChange={(e) =>
              setStaffForm((f) => ({ ...f, name: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Phone"
            value={staffForm.phone}
            onChange={(e) =>
              setStaffForm((f) => ({ ...f, phone: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <input
            type="email"
            required
            placeholder="Email (e.g. meena@priya.com)"
            value={staffForm.email}
            onChange={(e) =>
              setStaffForm((f) => ({ ...f, email: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit" className="w-full">
            Add Staff
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Add Udhaar Modal */}
      <BoutiqueModal
        open={addUdhaarOpen}
        onClose={() => setAddUdhaarOpen(false)}
        title="Naya Udhaar Add Karein"
      >
        <form onSubmit={handleCreateUdhaar} className="space-y-3">
          <select
            value={udhaarForm.customer_id}
            onChange={(e) =>
              setUdhaarForm((f) => ({ ...f, customer_id: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
          <input
            type="number"
            required
            placeholder="Udhaar Amount (₹)"
            value={udhaarForm.amount}
            onChange={(e) =>
              setUdhaarForm((f) => ({ ...f, amount: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <input
            type="date"
            value={udhaarForm.due_date}
            onChange={(e) =>
              setUdhaarForm((f) => ({ ...f, due_date: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit" className="w-full">
            Save Udhaar
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Add Measurement Modal */}
      <BoutiqueModal
        open={addMeasOpen}
        onClose={() => setAddMeasOpen(false)}
        title="Naya Measurement Save Karein"
      >
        <form onSubmit={handleCreateMeasurement} className="space-y-3">
          <select
            value={measForm.customer_id}
            onChange={(e) =>
              setMeasForm((f) => ({ ...f, customer_id: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Blouse"
              value={measForm.blouse}
              onChange={(e) =>
                setMeasForm((f) => ({ ...f, blouse: e.target.value }))
              }
              className="rounded-full border border-gold/40 bg-white px-3 py-2 text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Sleeve"
              value={measForm.sleeve}
              onChange={(e) =>
                setMeasForm((f) => ({ ...f, sleeve: e.target.value }))
              }
              className="rounded-full border border-gold/40 bg-white px-3 py-2 text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Length"
              value={measForm.length}
              onChange={(e) =>
                setMeasForm((f) => ({ ...f, length: e.target.value }))
              }
              className="rounded-full border border-gold/40 bg-white px-3 py-2 text-xs outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Waist"
              value={measForm.waist}
              onChange={(e) =>
                setMeasForm((f) => ({ ...f, waist: e.target.value }))
              }
              className="rounded-full border border-gold/40 bg-white px-3 py-2 text-xs outline-none"
            />
            <input
              type="text"
              placeholder="Shoulder"
              value={measForm.shoulder}
              onChange={(e) =>
                setMeasForm((f) => ({ ...f, shoulder: e.target.value }))
              }
              className="rounded-full border border-gold/40 bg-white px-3 py-2 text-xs outline-none"
            />
          </div>
          <input
            type="date"
            value={measForm.delivery_date}
            onChange={(e) =>
              setMeasForm((f) => ({ ...f, delivery_date: e.target.value }))
            }
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit" className="w-full">
            Save Measurement
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Print Tailor Slip Modal */}
      <BoutiqueModal
        open={!!printMeas}
        onClose={() => setPrintMeas(null)}
        title="Tailor Measurement Slip"
      >
        {printMeas && (
          <div className="space-y-3 text-sm">
            <div className="rounded-2xl bg-white p-4 border border-gold/40 space-y-1.5">
              <p className="font-serif font-bold text-lg text-maroon">
                {shopProfile.name} — Tailor Slip
              </p>
              <p>
                <strong>Customer:</strong> {printMeas.customer.name} (
                {printMeas.customer.phone})
              </p>
              <p>
                <strong>Blouse:</strong> {printMeas.blouse}&rdquo; |{" "}
                <strong>Sleeve:</strong> {printMeas.sleeve}&rdquo; |{" "}
                <strong>Length:</strong> {printMeas.length}&rdquo;
              </p>
              <p>
                <strong>Waist:</strong> {printMeas.waist}&rdquo; |{" "}
                <strong>Shoulder:</strong> {printMeas.shoulder}&rdquo;
              </p>
              <p>
                <strong>Status:</strong> {printMeas.status} |{" "}
                <strong>Delivery:</strong>{" "}
                {printMeas.delivery_date
                  ? new Date(printMeas.delivery_date).toLocaleDateString("en-IN")
                  : "-"}
              </p>
            </div>
            <BoutiqueButton
              onClick={() => window.print()}
              className="w-full"
            >
              <CssDocIcon />
              <span>Print Tailor Slip</span>
            </BoutiqueButton>
          </div>
        )}
      </BoutiqueModal>
      <HinglishAIChatbot />
    </main>
  );
}
