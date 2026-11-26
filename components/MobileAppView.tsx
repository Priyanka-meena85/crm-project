"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Camera,
  CheckCircle2,
  Crown,
  Heart,
  PackageCheck,
  QrCode,
  ScanBarcode,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  XCircle,
} from "lucide-react";
import {
  BoutiqueButton,
  BoutiqueCard,
  GoldDivider,
  VipBadge,
  WhatsAppButton,
} from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";
import { formatINR } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

type MobileMode = "staff" | "warehouse" | "owner";

interface MobileCustomer {
  id: string;
  name: string;
  phone: string;
  size: string;
  pasand: string;
  total_kharida: number;
  is_vip: boolean;
}

interface MobileOrder {
  id: string;
  orderNo: string;
  customerName: string;
  itemName: string;
  size: string;
  amount: number;
  courier: string;
  courierStatus: string;
  barcode: string;
  qcStatus?: string;
}

interface ApprovalItem {
  id: string;
  staffName: string;
  type: string;
  customerName: string;
  amount: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

interface WishlistItem {
  id: string;
  customerName: string;
  phone: string;
  itemName: string;
  size: string;
}

export function MobileAppView() {
  const { showToast } = useToast();
  const [mode, setMode] = useState<MobileMode>("staff");

  const [checkinPhone, setCheckinPhone] = useState("9876543210");
  const [checkedCustomer, setCheckedCustomer] = useState<MobileCustomer | null>(null);
  const [barcodeInput, setBarcodeInput] = useState("PB-KUR-M-02");
  const [scanResult, setScanResult] = useState<{
    item: string;
    storeQty: number;
    udaipurBranchQty: number;
  } | null>(null);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [pickBarcode, setPickBarcode] = useState("PB-ANA-L-04");
  const [pickVerifiedId, setPickVerifiedId] = useState<string | null>(null);

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);

  const loadMobileData = useCallback(async () => {
    const [custRes, omniRes] = await Promise.all([
      fetch(`/api/customers?search=${encodeURIComponent(checkinPhone)}`),
      fetch("/api/omnichannel"),
    ]);
    if (custRes.ok) {
      const d = await custRes.json();
      setCheckedCustomer(d.customers?.[0] || null);
    }
    if (omniRes.ok) {
      const d = await omniRes.json();
      setOrders(d.orders || []);
      setApprovals(d.approvals || []);
      setWishlist(d.wishlist || []);
    }
  }, [checkinPhone]);

  useEffect(() => {
    loadMobileData();
  }, [loadMobileData]);

  const handleBarcodeScan = () => {
    const code = barcodeInput.toUpperCase();
    if (code.includes("KUR")) {
      setScanResult({ item: "Red Kurti (Size M)", storeQty: 1, udaipurBranchQty: 6 });
    } else if (code.includes("LEH")) {
      setScanResult({ item: "Red Lehenga (Size L)", storeQty: 0, udaipurBranchQty: 3 });
    } else {
      setScanResult({ item: "Blue Saree (Size M)", storeQty: 6, udaipurBranchQty: 4 });
    }
    showToast("Barcode Scanned!");
  };

  const handleAddWishlist = async () => {
    const res = await fetch("/api/omnichannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "add_wishlist",
        payload: {
          customerName: checkedCustomer?.name || "Anjali Sharma",
          phone: checkedCustomer?.phone || "9876543210",
          itemName: scanResult?.item || "Red Lehenga",
          size: "L",
        },
      }),
    });
    if (res.ok) {
      showToast("Wishlist me Add hua! Stock aate hi WhatsApp jayega.");
      loadMobileData();
    }
  };

  const handlePickVerify = (order: MobileOrder) => {
    if (pickBarcode.trim().toUpperCase() === order.barcode.toUpperCase()) {
      setPickVerifiedId(order.id);
      showToast(`Verified ✓ ${order.itemName} (${order.size}) ready to pack!`);
    } else {
      showToast(`Wrong Barcode! Expected ${order.barcode}`, "error");
    }
  };

  const handleQC = async (orderId: string, qcStatus: "OK" | "Damaged" | "Used") => {
    const res = await fetch("/api/omnichannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "qc_update",
        id: orderId,
        payload: { qcStatus },
      }),
    });
    if (res.ok) {
      showToast(
        qcStatus === "OK"
          ? "QC OK ✓ Instant Razorpay Refund Triggered!"
          : `QC Marked: ${qcStatus}`
      );
      loadMobileData();
    }
  };

  const handleApproval = async (id: string, status: "Approved" | "Rejected") => {
    const res = await fetch("/api/omnichannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "approval",
        id,
        payload: { status },
      }),
    });
    if (res.ok) {
      showToast(`Request ${status}!`);
      loadMobileData();
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-3 sm:px-6 pb-16 pt-4">
      <section className="text-center py-5">
        <div className="inline-flex items-center gap-2 rounded-full bg-softpink px-4 py-1.5 text-xs font-bold text-maroon border border-gold/40 mb-2">
          <Smartphone className="h-3.5 w-3.5 text-gold" />
          <span>Android Companion App (3 Execution Modes)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-maroon">
          Priya Boutique — Mobile App
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-charcoal/75">
          Store Staff, Warehouse Dispatch, aur Owner Pocket Mode
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {[
          { key: "staff" as const, label: "Mode 1: Store Staff", icon: <Store className="h-4 w-4" /> },
          { key: "warehouse" as const, label: "Mode 2: Warehouse & QC", icon: <Truck className="h-4 w-4" /> },
          { key: "owner" as const, label: "Mode 3: Owner Pocket", icon: <Crown className="h-4 w-4" /> },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold border transition-all ${mode === m.key
              ? "bg-gradient-to-r from-maroon to-maroon-light text-white border-gold shadow-gold-glow"
              : "bg-white text-charcoal border-gold/35 hover:border-maroon"
              }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-2xl rounded-[38px] bg-charcoal p-3 sm:p-4 shadow-boutique-hover border-4 border-gold/60">
        <div className="rounded-[30px] bg-ivory p-4 sm:p-6 min-h-[540px]">
          <AnimatePresence mode="wait">
            {mode === "staff" && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <BoutiqueCard>
                  <div className="flex items-center gap-2 mb-3">
                    <QrCode className="h-4 w-4 text-maroon" />
                    <h2 className="font-serif text-lg font-bold text-maroon">
                      1. QR / Phone Check-In
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={checkinPhone}
                      onChange={(e) => setCheckinPhone(e.target.value)}
                      placeholder="Customer Phone..."
                      className="flex-1 rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm outline-none"
                    />
                    <BoutiqueButton onClick={loadMobileData} className="py-2 text-xs">
                      Check-in
                    </BoutiqueButton>
                  </div>

                  {checkedCustomer && (
                    <div className="mt-3 rounded-2xl bg-softpink p-3.5 border border-gold/35 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-maroon">
                          {checkedCustomer.name}
                        </span>
                        {checkedCustomer.is_vip && <VipBadge />}
                      </div>
                      <p className="text-xs text-charcoal/80">
                        Size DNA: <strong>Top {checkedCustomer.size}</strong> •
                        Loyalty Points:{" "}
                        <strong>{Math.round(checkedCustomer.total_kharida / 100)} pts</strong>
                      </p>
                      <p className="text-xs text-charcoal/70">
                        Pasand: {checkedCustomer.pasand}
                      </p>
                      <div className="pt-1">
                        <WhatsAppButton
                          label="Send Digital Receipt"
                          href={buildWhatsAppLink(
                            checkedCustomer.phone,
                            `Namaste ${checkedCustomer.name} ji! Priya Boutique me aapka swagat hai. Aapke Loyalty Points: ${Math.round(checkedCustomer.total_kharida / 100)} pts.`
                          )}
                          className="py-1.5 px-3.5 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </BoutiqueCard>

                <BoutiqueCard>
                  <div className="flex items-center gap-2 mb-3">
                    <ScanBarcode className="h-4 w-4 text-maroon" />
                    <h2 className="font-serif text-lg font-bold text-maroon">
                      2. Tag Barcode Scanner (Multi-Branch)
                    </h2>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan Barcode (PB-KUR-M-02 / PB-LEH-L)"
                      className="flex-1 rounded-full border border-gold/40 bg-ivory px-4 py-2 text-xs outline-none"
                    />
                    <BoutiqueButton onClick={handleBarcodeScan} className="py-2 text-xs">
                      Scan Tag
                    </BoutiqueButton>
                  </div>

                  {scanResult && (
                    <div className="mt-3 rounded-2xl bg-white p-3.5 border border-gold/35 space-y-2">
                      <p className="font-semibold text-sm text-maroon">
                        {scanResult.item}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span
                          className={`rounded-full px-3 py-1 font-bold ${scanResult.storeQty > 0
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          Nathdwara Store: {scanResult.storeQty} pcs
                        </span>
                        <span className="rounded-full bg-ivory px-3 py-1 font-bold text-maroon border border-gold/40">
                          Udaipur Branch: {scanResult.udaipurBranchQty} pcs
                        </span>
                      </div>
                      <BoutiqueButton
                        variant="outline"
                        onClick={handleAddWishlist}
                        className="w-full py-1.5 text-xs"
                      >
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        <span>Size Nahi Hai? Add to Wishlist & Notify</span>
                      </BoutiqueButton>
                    </div>
                  )}

                  {wishlist.length > 0 && (
                    <div className="mt-3 text-xs text-charcoal/75">
                      <strong>Wishlist ({wishlist.length}):</strong>{" "}
                      {wishlist[0].customerName} — {wishlist[0].itemName} (Size{" "}
                      {wishlist[0].size})
                    </div>
                  )}
                </BoutiqueCard>
              </motion.div>
            )}

            {mode === "warehouse" && (
              <motion.div
                key="warehouse"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <BoutiqueCard>
                  <div className="flex items-center gap-2 mb-3">
                    <PackageCheck className="h-4 w-4 text-maroon" />
                    <h2 className="font-serif text-lg font-bold text-maroon">
                      Barcode Pick & Pack Verification
                    </h2>
                  </div>
                  <input
                    type="text"
                    value={pickBarcode}
                    onChange={(e) => setPickBarcode(e.target.value)}
                    placeholder="Scan Barcode before Dispatch (e.g. PB-ANA-L-04)"
                    className="w-full rounded-full border border-gold/40 bg-ivory px-4 py-2 text-xs outline-none mb-3"
                  />
                  <div className="space-y-2.5">
                    {orders.slice(0, 3).map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl bg-white p-3 border border-gold/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <p className="font-semibold text-xs text-maroon">
                            #{ord.orderNo} • {ord.itemName} (Size {ord.size})
                          </p>
                          <p className="text-[11px] text-charcoal/65">
                            Barcode: <code>{ord.barcode}</code> • {ord.courier}
                          </p>
                        </div>
                        {pickVerifiedId === ord.id ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Packed ✓
                          </span>
                        ) : (
                          <BoutiqueButton
                            variant="outline"
                            onClick={() => handlePickVerify(ord)}
                            className="py-1 px-3 text-xs"
                          >
                            Verify Scan
                          </BoutiqueButton>
                        )}
                      </div>
                    ))}
                  </div>
                </BoutiqueCard>

                <BoutiqueCard>
                  <div className="flex items-center gap-2 mb-3">
                    <Camera className="h-4 w-4 text-maroon" />
                    <h2 className="font-serif text-lg font-bold text-maroon">
                      Return Quality Check (QC) & Instant Refund
                    </h2>
                  </div>
                  {orders
                    .filter((o) => o.qcStatus)
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl bg-softpink p-3.5 border border-gold/35 space-y-2.5"
                      >
                        <div className="flex justify-between text-xs font-bold text-maroon">
                          <span>
                            Return #{ord.orderNo} — {ord.itemName}
                          </span>
                          <span>QC: {ord.qcStatus}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(["OK", "Damaged", "Used"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleQC(ord.id, st)}
                              className={`rounded-full px-3 py-1 text-xs font-bold border ${ord.qcStatus === st
                                ? "bg-maroon text-white border-maroon"
                                : "bg-white text-charcoal border-gold/40"
                                }`}
                            >
                              Mark {st}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </BoutiqueCard>
              </motion.div>
            )}

            {mode === "owner" && (
              <motion.div
                key="owner"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <BoutiqueCard className="bg-gradient-to-r from-maroon to-maroon-light text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gold-soft uppercase font-bold">
                        Live Pocket Sales
                      </p>
                      <p className="font-serif text-3xl font-extrabold mt-1">
                        ₹45,000
                      </p>
                    </div>
                    <Bell className="h-6 w-6 text-gold-shine animate-bounce" />
                  </div>
                  <p className="text-xs text-gold-soft/90 mt-2">
                    🔔 Naya VIP Order: Anjali Sharma (₹15,000 Red Lehenga)
                  </p>
                </BoutiqueCard>

                <BoutiqueCard>
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-4 w-4 text-maroon" />
                    <h2 className="font-serif text-lg font-bold text-maroon">
                      1-Click Quick Approvals
                    </h2>
                  </div>
                  <div className="space-y-2.5">
                    {approvals.map((ap) => (
                      <div
                        key={ap.id}
                        className="rounded-2xl bg-white p-3.5 border border-gold/35 space-y-2"
                      >
                        <div className="flex justify-between text-xs font-bold text-maroon">
                          <span>
                            {ap.staffName} • {ap.type}
                          </span>
                          <span>{formatINR(ap.amount)}</span>
                        </div>
                        <p className="text-xs text-charcoal/75">
                          {ap.customerName} — {ap.reason}
                        </p>
                        {ap.status === "Pending" ? (
                          <div className="flex gap-2">
                            <BoutiqueButton
                              onClick={() => handleApproval(ap.id, "Approved")}
                              className="py-1 px-3 text-xs"
                            >
                              Approve ✓
                            </BoutiqueButton>
                            <button
                              type="button"
                              onClick={() => handleApproval(ap.id, "Rejected")}
                              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 border border-red-200"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">
                            {ap.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </BoutiqueCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <GoldDivider label="Synced Live with Web CRM" />
    </main>
  );
}

