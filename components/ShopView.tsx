"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CssBagIcon,
  CssDiamondIcon,
  CssDocIcon,
  CssDownloadIcon,
  CssMinusIcon,
  CssPhoneIcon,
  CssPlusIcon,
  CssSearchIcon,
  CssTrashIcon,
  CssUserIcon,
} from "@/components/CssIcons";
import {
  BoutiqueButton,
  BoutiqueCard,
  BoutiqueModal,
  GoldConfettiBurst,
  GoldDivider,
  VipBadge,
  WhatsAppButton,
} from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";
import { formatINR } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  phone: string;
  city: string;
  size: string;
  pasand: string;
  total_kharida: number;
  is_vip: boolean;
  is_inactive: boolean;
}

interface StockItem {
  id: string;
  size: string;
  quantity: number;
  low_stock_threshold: number;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  photo_url: string;
  stocks: StockItem[];
}

interface CartItem {
  key: string;
  product_id: string;
  name: string;
  size: string;
  price: number;
  qty: number;
}

interface GeneratedBill {
  id: string;
  bill_no: number;
  final_total: number;
  payment_method: string;
  waLink: string;
  customerName: string;
}

export function ShopView({ staffId }: { staffId?: string }) {
  const { showToast } = useToast();
  const stockSectionRef = useRef<HTMLDivElement>(null);
  const billingSectionRef = useRef<HTMLDivElement>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "UPI" | "Card" | "Udhaar">("UPI");
  const [submittingBill, setSubmittingBill] = useState(false);

  // Confetti & Modals
  const [showConfetti, setShowConfetti] = useState(false);
  const [generatedBill, setGeneratedBill] = useState<GeneratedBill | null>(null);
  const [newCustomerOpen, setNewCustomerOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [billHistoryOpen, setBillHistoryOpen] = useState(false);
  const [billHistory, setBillHistory] = useState<
    {
      id: string;
      bill_no: number;
      final_total: number;
      payment_method: string;
      status: string;
      createdAt: string;
      customer: { name: string; phone: string };
      items: { qty: number; size: string; product: { name: string } }[];
    }[]
  >([]);
  const [stockCategory, setStockCategory] = useState("All");
  const [billingCategory, setBillingCategory] = useState("All");
  const [billingSearch, setBillingSearch] = useState("");

  // New Customer Form
  const [custForm, setCustForm] = useState({
    name: "",
    phone: "",
    city: "Nathdwara",
    size: "M",
    pasand: "",
    birthday: "",
    anniversary: "",
  });

  const loadData = useCallback(async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        fetch(`/api/customers?search=${encodeURIComponent(customerSearch)}`),
        fetch("/api/products"),
      ]);
      if (custRes.ok) {
        const data = await custRes.json();
        setCustomers(data.customers || []);
        if (!selectedCustomer && data.customers?.length > 0) {
          setSelectedCustomer(data.customers[0]);
        }
      }
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
    } catch {
      showToast("Data load karne me dikkat aayi.", "error");
    }
  }, [customerSearch, selectedCustomer, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadData]);

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );
  const finalTotal = Math.max(0, subtotal - Number(discount || 0));

  const filteredStockProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = stockCategory === "All" || p.category === stockCategory;
      const q = stockSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, stockSearch, stockCategory]);

  const filteredBillingProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat =
        billingCategory === "All" || p.category === billingCategory;
      const q = billingSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, billingSearch, billingCategory]);

  const loadBillHistory = async (customerId?: string) => {
    const url = customerId ? `/api/bills?customerId=${customerId}` : "/api/bills";
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      setBillHistory(data.bills || []);
      setBillHistoryOpen(true);
    }
  };

  const handleReturnBill = async (billId: string) => {
    const res = await fetch(`/api/bills/${billId}/return`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message || "Return Bill ban gaya!");
      loadBillHistory();
      loadData();
    } else {
      showToast(data.error || "Return nahi ho paya.", "error");
    }
  };

  const handleAddToBill = (product: Product) => {
    const chosenSize =
      selectedSizes[product.id] || product.stocks[0]?.size || "M";
    const key = `${product.id}-${chosenSize}`;

    setCart((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          key,
          product_id: product.id,
          name: product.name,
          size: chosenSize,
          price: product.price,
          qty: 1,
        },
      ];
    });
    showToast(`${product.name} (${chosenSize}) bill me add hua!`);
  };

  const updateCartQty = (key: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleGenerateBill = async () => {
    if (!selectedCustomer) {
      showToast("Pehle Customer select karein!", "error");
      return;
    }
    if (cart.length === 0) {
      showToast("Bill me kam se kam 1 kapda add karein!", "error");
      return;
    }

    setSubmittingBill(true);
    try {
      const res = await fetch("/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: selectedCustomer.id,
          staff_id: staffId,
          items: cart.map((c) => ({
            product_id: c.product_id,
            size: c.size,
            qty: c.qty,
            price: c.price,
          })),
          discount,
          payment_method: paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Bill nahi ban paya.", "error");
        return;
      }

      // Gold Confetti Burst + Success Modal + Toast
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3200);

      setGeneratedBill({
        id: data.bill.id,
        bill_no: data.bill.bill_no,
        final_total: data.bill.final_total,
        payment_method: data.bill.payment_method,
        waLink: data.waLink,
        customerName: selectedCustomer.name,
      });

      setCart([]);
      setDiscount(0);
      showToast(`Bill Ban Gaya! #${data.bill.bill_no}`);
      loadData();
    } catch {
      showToast("Network error! Bill generate nahi hua.", "error");
    } finally {
      setSubmittingBill(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(custForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Customer save nahi hua.", "error");
        return;
      }
      setSelectedCustomer(data.customer);
      setNewCustomerOpen(false);
      setCustForm({
        name: "",
        phone: "",
        city: "Nathdwara",
        size: "M",
        pasand: "",
        birthday: "",
        anniversary: "",
      });
      showToast("Naya Customer Save Ho Gaya!");
      loadData();
    } catch {
      showToast("Error saving customer.", "error");
    }
  };

  const handleSendQuickOffer = async () => {
    if (!selectedCustomer) {
      showToast("Pehle customer select karein!", "error");
      return;
    }
    try {
      const res = await fetch("/api/marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "VIP Boutique Offer",
          template: `Namaste ${selectedCustomer.name} ji! Priya Boutique Nathdwara me naya festive stock aaya hai. Aapke liye khaas 15% OFF!`,
          customerPhone: selectedCustomer.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Offer Bhej Diya!");
        setOfferModalOpen(false);
        if (data.waLink) {
          window.open(data.waLink, "_blank", "noopener,noreferrer");
        }
      }
    } catch {
      showToast("Offer send nahi ho paya.", "error");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-3 sm:px-6 pb-16 pt-4">
      <GoldConfettiBurst active={showConfetti} />

      {/* 1. Hero Header with Staggered Fade-Up */}
      <section className="text-center py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-maroon shadow-sm border border-gold/40 mb-3"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <span>● Aaj 18 Customer Aaye</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="font-serif text-3xl sm:text-5xl font-extrabold text-maroon tracking-tight"
        >
          Priya Boutique CRM
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-2 text-sm sm:text-base text-charcoal/80 font-medium"
        >
          &ldquo;Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi&rdquo;
        </motion.p>
      </section>

      {/* Top Bar: Search + Quick Actions */}
      <BoutiqueCard className="mb-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold flex items-center">
              <CssSearchIcon />
            </span>
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Phone se Customer Dhoondo..."
              className="w-full rounded-full border border-gold/45 bg-ivory/75 py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <BoutiqueButton
              variant="outline"
              onClick={() => setNewCustomerOpen(true)}
            >
              <CssUserIcon />
              <span>New Customer</span>
            </BoutiqueButton>

            <BoutiqueButton
              onClick={() =>
                billingSectionRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <CssDocIcon />
              <span>New Bill</span>
            </BoutiqueButton>

            <BoutiqueButton
              variant="outline"
              onClick={() =>
                stockSectionRef.current?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <CssSearchIcon />
              <span>Check Stock</span>
            </BoutiqueButton>

            <BoutiqueButton
              variant="outline"
              onClick={() => loadBillHistory()}
            >
              <CssDocIcon />
              <span>Bill History</span>
            </BoutiqueButton>

            <BoutiqueButton
              variant="gold"
              onClick={() => setOfferModalOpen(true)}
            >
              <CssDiamondIcon />
              <span>Send Offer</span>
            </BoutiqueButton>
          </div>
        </div>
      </BoutiqueCard>

      <GoldDivider label="3-Step Fast Billing" />

      {/* Selected Customer 360° Smart Pitch Banner */}
      <AnimatePresence mode="wait">
        {selectedCustomer && (
          <motion.div
            key={selectedCustomer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 rounded-[24px] bg-gradient-to-r from-maroon via-maroon-light to-maroon p-4 sm:p-5 text-white shadow-boutique border border-gold/50 flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-shine text-maroon font-serif font-extrabold text-lg shadow">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-serif text-lg font-bold">
                    {selectedCustomer.name}
                  </span>
                  {selectedCustomer.is_vip && <VipBadge />}
                  {selectedCustomer.is_inactive && (
                    <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase">
                      Welcome Back 20% OFF
                    </span>
                  )}
                </div>
                <p className="text-xs text-gold-soft/90 mt-0.5">
                  Size: <strong>{selectedCustomer.size}</strong> • Pasand:{" "}
                  <strong>{selectedCustomer.pasand || "Bridal & Festive"}</strong>{" "}
                  • Total Kharida: <strong>{formatINR(selectedCustomer.total_kharida)}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => loadBillHistory(selectedCustomer.id)}
                className="rounded-full bg-white/15 hover:bg-white/25 px-4 py-1.5 text-xs font-semibold border border-gold/40 transition-colors"
              >
                Purane Bills Dekhein
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3-Column Billing Workspace */}
      <div
        ref={billingSectionRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
      >
        {/* Column 1: Customer Select */}
        <BoutiqueCard className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-maroon">
              1. Customer Chunein
            </h2>
            <span className="text-xs font-semibold text-gold">
              {customers.length} mile
            </span>
          </div>

          <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {customers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <motion.button
                    layout
                    key={cust.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    onClick={() => setSelectedCustomer(cust)}
                    className={`w-full text-left rounded-2xl p-3.5 border transition-all ${
                      isSelected
                        ? "bg-softpink border-maroon shadow-md"
                        : "bg-ivory/60 border-gold/25 hover:border-gold"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-charcoal">
                          {cust.name}
                        </p>
                        <p className="text-xs text-charcoal/70 flex items-center gap-1.5 mt-0.5">
                          <CssPhoneIcon className="text-maroon" />
                          {cust.phone}
                        </p>
                      </div>
                      {cust.is_vip && <VipBadge />}
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                      <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-maroon border border-maroon/15">
                        Size: {cust.size}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-0.5 font-semibold text-charcoal border border-gold/30">
                        Total: {formatINR(cust.total_kharida)}
                      </span>
                      {cust.is_inactive && (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          loadBillHistory(cust.id);
                        }}
                        className="rounded-full bg-ivory px-2.5 py-0.5 font-semibold text-maroon border border-gold/40 hover:bg-gold-soft"
                      >
                        History
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </BoutiqueCard>

        {/* Column 2: Add Items (Product Cards with Image Zoom 1.05x + Gold Overlay) */}
        <BoutiqueCard className="lg:col-span-5" delay={0.08}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-maroon">
              2. Kapde Add Karein
            </h2>
            <span className="text-xs text-charcoal/65">
              {filteredBillingProducts.length} items
            </span>
          </div>

          <div className="space-y-2.5 mb-4">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold flex items-center">
                <CssSearchIcon />
              </span>
              <input
                type="text"
                value={billingSearch}
                onChange={(e) => setBillingSearch(e.target.value)}
                placeholder="Kapda dhoondo (Kurti, Saree, Lehenga)..."
                className="w-full rounded-full border border-gold/40 bg-ivory/80 py-1.5 pl-9 pr-4 text-xs outline-none focus:border-maroon"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["All", "Kurti", "Saree", "Lehenga", "Suit", "Gown"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setBillingCategory(cat)}
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-all ${
                    billingCategory === cat
                      ? "bg-maroon text-white border-maroon"
                      : "bg-ivory text-charcoal border-gold/35 hover:border-maroon"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
            {filteredBillingProducts.map((product) => {
              const activeSize =
                selectedSizes[product.id] || product.stocks[0]?.size || "M";
              return (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -5 }}
                  className="group rounded-[22px] border border-gold/30 bg-ivory/70 overflow-hidden shadow-sm hover:shadow-boutique transition-all"
                >
                  <div className="relative h-36 w-full overflow-hidden">
                    <img
                      src={
                        product.photo_url ||
                        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80"
                      }
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gold/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-maroon shadow">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-bold text-sm text-charcoal truncate">
                        {product.name}
                      </h3>
                      <span className="font-bold text-sm text-maroon">
                        {formatINR(product.price)}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      {(product.stocks.length > 0
                        ? product.stocks
                        : [
                            { id: "s", size: "S", quantity: 3, low_stock_threshold: 2 },
                            { id: "m", size: "M", quantity: 3, low_stock_threshold: 2 },
                            { id: "l", size: "L", quantity: 3, low_stock_threshold: 2 },
                          ]
                      ).map((st) => {
                        const isOut = st.quantity === 0;
                        const isLow = st.quantity > 0 && st.quantity < st.low_stock_threshold;
                        return (
                          <button
                            key={st.size}
                            type="button"
                            disabled={isOut}
                            onClick={() =>
                              setSelectedSizes((prev) => ({
                                ...prev,
                                [product.id]: st.size,
                              }))
                            }
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border transition-all disabled:opacity-40 disabled:line-through ${
                              activeSize === st.size
                                ? "bg-maroon text-white border-maroon"
                                : isLow
                                ? "bg-red-50 text-red-700 border-red-300"
                                : "bg-white text-charcoal border-gold/40 hover:border-maroon"
                            }`}
                          >
                            {st.size} ({st.quantity})
                          </button>
                        );
                      })}
                    </div>

                    <BoutiqueButton
                      onClick={() => handleAddToBill(product)}
                      className="mt-3 w-full py-2 text-xs"
                    >
                      <CssBagIcon />
                      <span>Add to Bill</span>
                    </BoutiqueButton>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </BoutiqueCard>

        {/* Column 3: Bill Summary */}
        <BoutiqueCard className="lg:col-span-4" delay={0.14}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-maroon">
              3. Bill Summary
            </h2>
            {selectedCustomer && (
              <span className="rounded-full bg-softpink px-3 py-1 text-xs font-semibold text-maroon">
                {selectedCustomer.name}
              </span>
            )}
          </div>

          <div className="space-y-2.5 min-h-[150px] max-h-[260px] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gold/50 py-10 text-center text-xs text-charcoal/60">
                <CssDiamondIcon className="text-gold mb-2" />
                <span>Abhi koi kapda add nahi hai</span>
              </div>
            ) : (
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: "spring", stiffness: 320, damping: 24 }}
                    className="flex items-center justify-between gap-2 rounded-2xl bg-ivory/80 p-3 border border-gold/30"
                  >
                    <div>
                      <p className="font-semibold text-sm text-charcoal">
                        {item.name}{" "}
                        <span className="text-xs text-maroon">({item.size})</span>
                      </p>
                      <p className="text-xs text-charcoal/70">
                        {formatINR(item.price)} × {item.qty}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, -1)}
                        className="rounded-full bg-white p-1.5 border border-gold/40 hover:bg-softpink inline-flex items-center justify-center"
                      >
                        <CssMinusIcon className="text-maroon" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold">
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, 1)}
                        className="rounded-full bg-white p-1.5 border border-gold/40 hover:bg-softpink inline-flex items-center justify-center"
                      >
                        <CssPlusIcon className="text-maroon" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.key, -item.qty)}
                        className="rounded-full p-1.5 text-red-600 hover:bg-red-50 ml-1 inline-flex items-center justify-center"
                      >
                        <CssTrashIcon />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-gold/30 pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-charcoal/75">Subtotal</span>
              <span className="font-semibold">{formatINR(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="text-charcoal/75">Discount (₹)</label>
              <input
                type="number"
                min={0}
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="w-28 rounded-full border border-gold/40 bg-ivory px-3 py-1 text-right text-sm font-semibold outline-none focus:border-maroon"
              />
            </div>

            {/* Quick Discount Pills */}
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              {[
                { label: "0%", val: 0 },
                { label: "5% OFF", val: Math.round(subtotal * 0.05) },
                { label: "10% OFF", val: Math.round(subtotal * 0.1) },
                { label: "₹500 OFF", val: 500 },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => setDiscount(d.val)}
                  className="rounded-full bg-ivory px-2.5 py-0.5 text-[11px] font-semibold text-maroon border border-gold/40 hover:bg-softpink transition-colors"
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Total Bounce on Change */}
            <motion.div
              key={finalTotal}
              initial={{ scale: 0.92 }}
              animate={{ scale: [1.08, 1] }}
              transition={{ type: "spring", stiffness: 360, damping: 16 }}
              className="flex items-center justify-between rounded-2xl bg-softpink px-4 py-3 border border-maroon/20"
            >
              <span className="font-serif font-bold text-maroon">
                Final Total
              </span>
              <span className="font-serif text-2xl font-extrabold text-maroon">
                {formatINR(finalTotal)}
              </span>
            </motion.div>

            {/* Payment Method */}
            <div>
              <p className="text-xs font-semibold text-maroon mb-2">
                Payment Mode
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {(["Cash", "UPI", "Card", "Udhaar"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`rounded-full py-1.5 text-xs font-semibold border transition-all ${
                      paymentMethod === mode
                        ? "bg-maroon text-white border-maroon shadow-sm"
                        : "bg-white text-charcoal border-gold/40 hover:border-maroon"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <BoutiqueButton
              onClick={handleGenerateBill}
              disabled={submittingBill || cart.length === 0}
              className="w-full py-3.5 text-base"
            >
              <CssDocIcon />
              <span>
                {submittingBill ? "Bill Ban Raha Hai..." : "Generate Bill"}
              </span>
            </BoutiqueButton>
          </div>
        </BoutiqueCard>
      </div>

      <GoldDivider label="2-Second Stock Check" />

      {/* Stock Check Section */}
      <div ref={stockSectionRef}>
        <BoutiqueCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-maroon">
                Almirah & Godown Stock Check
              </h2>
              <p className="text-xs text-charcoal/70">
                Turant dekhein kaunsa size bacha hai — bina almirah khole
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold flex items-center">
                <CssSearchIcon />
              </span>
              <input
                type="text"
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
                placeholder="Jaise: Red Kurti..."
                className="w-full rounded-full border border-gold/40 bg-ivory/80 py-2 pl-10 pr-4 text-sm outline-none focus:border-maroon"
              />
            </div>
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

          <div className="space-y-3">
            {filteredStockProducts.map((prod) => {
              const hasLowStock = prod.stocks.some(
                (s) => s.quantity < s.low_stock_threshold
              );
              return (
                <div
                  key={prod.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl p-4 border ${
                    hasLowStock
                      ? "bg-red-50/70 border-red-300 animate-row-shake"
                      : "bg-ivory/60 border-gold/25"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.photo_url}
                      alt={prod.name}
                      className="h-12 w-12 rounded-xl object-cover border border-gold/30"
                    />
                    <div>
                      <p className="font-serif font-bold text-maroon">
                        {prod.name}
                      </p>
                      <p className="text-xs text-charcoal/70">
                        {prod.category} • {formatINR(prod.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {prod.stocks.map((st) => {
                      const isOut = st.quantity === 0;
                      const isLow = st.quantity < st.low_stock_threshold;
                      return (
                        <span
                          key={st.id}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                            isOut
                              ? "bg-charcoal text-white border-charcoal"
                              : isLow
                              ? "bg-red-600 text-white border-red-700"
                              : "bg-white text-charcoal border-gold/40"
                          }`}
                        >
                          {isLow && !isOut && (
                            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                          )}
                          <span>
                            {st.size}: {isOut ? "Out Of Stock" : `${st.quantity} ${isLow ? "(LOW)" : "Piece"}`}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </BoutiqueCard>
      </div>

      {/* Bill Success Modal with PDF + WhatsApp Pulse Button */}
      <BoutiqueModal
        open={!!generatedBill}
        onClose={() => setGeneratedBill(null)}
        title="Bill Ban Gaya!"
      >
        {generatedBill && (
          <div className="text-center space-y-4">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-softpink px-5 py-2 text-maroon font-serif font-bold text-lg border border-gold/50">
              <span>Bill No. #{generatedBill.bill_no}</span>
            </div>
            <p className="text-sm text-charcoal/80">
              Customer: <strong>{generatedBill.customerName}</strong> • Payment:{" "}
              <strong>{generatedBill.payment_method}</strong>
            </p>
            <p className="font-serif text-3xl font-extrabold text-maroon">
              {formatINR(generatedBill.final_total)}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href={`/api/bills/${generatedBill.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <BoutiqueButton variant="outline" className="w-full">
                  <CssDownloadIcon />
                  <span>Download Bill PDF</span>
                </BoutiqueButton>
              </a>

              <WhatsAppButton
                label="Send Bill on WhatsApp PDF"
                href={generatedBill.waLink}
              />
            </div>
          </div>
        )}
      </BoutiqueModal>

      {/* New Customer Modal */}
      <BoutiqueModal
        open={newCustomerOpen}
        onClose={() => setNewCustomerOpen(false)}
        title="Naya Customer Jodein"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-maroon mb-1">
              Customer Naam *
            </label>
            <input
              type="text"
              required
              value={custForm.name}
              onChange={(e) =>
                setCustForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Jaise: Kavita Verma"
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-maroon mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={custForm.phone}
                onChange={(e) =>
                  setCustForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="9876543210"
                className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon mb-1">
                City
              </label>
              <input
                type="text"
                value={custForm.city}
                onChange={(e) =>
                  setCustForm((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-maroon mb-1">
                Size
              </label>
              <select
                value={custForm.size}
                onChange={(e) =>
                  setCustForm((f) => ({ ...f, size: e.target.value }))
                }
                className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
              >
                {["S", "M", "L", "XL", "XXL"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon mb-1">
                Birthday (Optional)
              </label>
              <input
                type="date"
                value={custForm.birthday}
                onChange={(e) =>
                  setCustForm((f) => ({ ...f, birthday: e.target.value }))
                }
                className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon mb-1">
              Anniversary (Optional)
            </label>
            <input
              type="date"
              value={custForm.anniversary}
              onChange={(e) =>
                setCustForm((f) => ({ ...f, anniversary: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon mb-1">
              Pasand / Notes
            </label>
            <input
              type="text"
              value={custForm.pasand}
              onChange={(e) =>
                setCustForm((f) => ({ ...f, pasand: e.target.value }))
              }
              placeholder="Red Kurti, Banarasi Saree..."
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none focus:border-maroon"
            />
          </div>

          <BoutiqueButton type="submit" className="w-full py-2.5">
            Save Customer
          </BoutiqueButton>
        </form>
      </BoutiqueModal>

      {/* Quick Offer Modal */}
      <BoutiqueModal
        open={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        title="WhatsApp Offer Bhejein"
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal/80">
            Selected Customer:{" "}
            <strong>{selectedCustomer?.name || "Koi nahi"}</strong> (
            {selectedCustomer?.phone || "-"})
          </p>
          <div className="rounded-2xl bg-softpink p-4 text-sm text-maroon border border-gold/40">
            &ldquo;Namaste {selectedCustomer?.name || "Didi"} ji! Priya Boutique
            Nathdwara me naya festive stock aaya hai. Aapke liye khaas 15%
            OFF!&rdquo;
          </div>
          <WhatsAppButton
            label="WhatsApp Pe Offer Bhejo"
            onClick={handleSendQuickOffer}
            className="w-full"
          />
        </div>
      </BoutiqueModal>

      {/* Bill History & Return/Exchange Modal */}
      <BoutiqueModal
        open={billHistoryOpen}
        onClose={() => setBillHistoryOpen(false)}
        title="Purane Bills & Return / Exchange"
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {billHistory.length === 0 ? (
            <p className="text-sm text-center text-charcoal/65 py-6">
              Koi bill history nahi mili.
            </p>
          ) : (
            billHistory.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl bg-white p-3.5 border border-gold/35 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-maroon">
                    Bill #{b.bill_no} — {b.customer?.name}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      b.status === "Returned"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-charcoal/70">
                  {b.items?.map((i) => `${i.product?.name} (${i.size}×${i.qty})`).join(", ")}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="font-bold text-sm text-maroon">
                    {formatINR(b.final_total)} ({b.payment_method})
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/bills/${b.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-ivory px-3 py-1 text-xs font-semibold text-maroon border border-gold/40"
                    >
                      PDF
                    </a>
                    {b.status !== "Returned" && (
                      <button
                        type="button"
                        onClick={() => handleReturnBill(b.id)}
                        className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Return Bill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </BoutiqueModal>
    </main>
  );
}
