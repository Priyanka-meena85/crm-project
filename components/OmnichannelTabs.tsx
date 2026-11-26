"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CssArrowIcon,
  CssBagIcon,
  CssChatIcon,
  CssCheckIcon,
  CssGearIcon,
} from "@/components/CssIcons";
import {
  BoutiqueButton,
  BoutiqueCard,
  WhatsAppButton,
} from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";
import { formatINR } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface OmniOrder {
  id: string;
  orderNo: string;
  channel: "Website" | "Instagram" | "Offline Store";
  customerName: string;
  customerPhone: string;
  itemName: string;
  size: string;
  amount: number;
  paymentType: "Prepaid" | "COD";
  codRisk: "Low" | "High";
  codVerified: boolean;
  courier: string;
  courierStatus: string;
  trackingId: string;
  exchangeRequested?: boolean;
}

interface AbandonedCart {
  id: string;
  customerName: string;
  phone: string;
  itemName: string;
  size: string;
  amount: number;
  abandonedAgo: string;
  recovered: boolean;
}

interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  connected: boolean;
  apiKeyMask: string;
}

interface InboxThread {
  id: string;
  channel: string;
  customerName: string;
  customerPhone: string;
  orderNo: string;
  orderAmount: number;
  orderStatus: string;
  unread: boolean;
  messages: { id: string; sender: string; text: string; time: string }[];
}

export function OmnichannelOrdersTab() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<OmniOrder[]>([]);
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [exchangeSize, setExchangeSize] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/omnichannel");
    if (res.ok) {
      const d = await res.json();
      setOrders(d.orders || []);
      setCarts(d.abandonedCarts || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAction = async (
    action: string,
    id: string,
    payload?: Record<string, string>
  ) => {
    const res = await fetch("/api/omnichannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, payload }),
    });
    if (res.ok) {
      showToast("Order Updated!");
      load();
    }
  };

  const visibleOrders =
    channelFilter === "All"
      ? orders
      : orders.filter((o) => o.channel === channelFilter);

  return (
    <div className="space-y-6">
      {/* Unified Omnichannel Orders + COD Shield + 1-Click Exchange */}
      <BoutiqueCard>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-maroon">
              Omnichannel Orders, RTO Shield & Live Courier
            </h3>
            <p className="text-xs text-charcoal/70">
              Website, Instagram, aur Offline Store ke saare orders ek jagah
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["All", "Website", "Instagram", "Offline Store"].map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannelFilter(ch)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold border ${
                  channelFilter === ch
                    ? "bg-maroon text-white border-maroon"
                    : "bg-ivory text-charcoal border-gold/35"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                <th className="py-3 px-3">Order & Channel</th>
                <th className="py-3 px-3">Customer & Item</th>
                <th className="py-3 px-3">Payment / RTO Risk</th>
                <th className="py-3 px-3">Courier Tracking</th>
                <th className="py-3 px-3">1-Click Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/20">
              {visibleOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-ivory/80">
                  <td className="py-3 px-3">
                    <p className="font-bold text-maroon">#{ord.orderNo}</p>
                    <span className="rounded-full bg-softpink px-2.5 py-0.5 text-[10px] font-bold text-maroon border border-gold/30">
                      {ord.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <p className="font-semibold">{ord.customerName}</p>
                    <p className="text-xs text-charcoal/70">
                      {ord.itemName} (Size {ord.size}) • {formatINR(ord.amount)}
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold">{ord.paymentType}</span>
                      {ord.paymentType === "COD" && (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold w-fit ${
                            ord.codRisk === "High"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {ord.codRisk === "Low" && <CssCheckIcon />}
                          {ord.codRisk} Risk {ord.codVerified ? "• Verified" : ""}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-xs">
                    <p className="font-semibold flex items-center gap-1.5 text-maroon">
                      <CssBagIcon />
                      {ord.courier}
                    </p>
                    <p className="text-charcoal/70">
                      {ord.courierStatus} ({ord.trackingId})
                    </p>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ord.paymentType === "COD" && !ord.codVerified && (
                        <BoutiqueButton
                          onClick={() => handleAction("verify_cod", ord.id)}
                          className="py-1 px-2.5 text-[11px]"
                        >
                          Verify COD
                        </BoutiqueButton>
                      )}
                      <select
                        value={exchangeSize[ord.id] || "L"}
                        onChange={(e) =>
                          setExchangeSize((p) => ({ ...p, [ord.id]: e.target.value }))
                        }
                        className="rounded-full border border-gold/40 bg-ivory px-2 py-1 text-[11px]"
                      >
                        {["S", "M", "L", "XL"].map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                      <BoutiqueButton
                        variant="outline"
                        onClick={() =>
                          handleAction("size_exchange", ord.id, {
                            newSize: exchangeSize[ord.id] || "L",
                          })
                        }
                        className="py-1 px-2.5 text-[11px]"
                      >
                        <span>1-Click Exchange</span>
                      </BoutiqueButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BoutiqueCard>

      {/* Abandoned Carts Live List */}
      <BoutiqueCard>
        <div className="flex items-center gap-2 mb-3">
          <CssBagIcon className="text-maroon" />
          <h3 className="font-serif text-lg font-bold text-maroon">
            Abandoned Carts (Auto Recovery)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {carts.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-ivory/75 p-3.5 border border-gold/35"
            >
              <div>
                <p className="font-semibold text-sm text-maroon">
                  {c.customerName} • {formatINR(c.amount)}
                </p>
                <p className="text-xs text-charcoal/70">
                  {c.itemName} (Size {c.size}) • {c.abandonedAgo}
                </p>
              </div>
              {c.recovered ? (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                  Sent ✓
                </span>
              ) : (
                <WhatsAppButton
                  label="Recover Cart"
                  onClick={() => {
                    handleAction("recover_cart", c.id);
                    window.open(
                      buildWhatsAppLink(
                        c.phone,
                        `Namaste ${c.customerName} ji! Aapka ${c.itemName} cart me wait kar raha hai. Abhi order karein aur 10% OFF payein!`
                      ),
                      "_blank",
                      "noopener,noreferrer"
                    );
                  }}
                  className="py-1.5 px-3 text-xs"
                />
              )}
            </div>
          ))}
        </div>
      </BoutiqueCard>
    </div>
  );
}

export function UnifiedInboxTab() {
  const { showToast } = useToast();
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [activeId, setActiveId] = useState<string>("th-1");
  const [replyText, setReplyText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/inbox");
    if (res.ok) {
      const d = await res.json();
      setThreads(d.threads || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeThread = threads.find((t) => t.id === activeId) || threads[0];

  const sendReply = async (text: string, orderAction?: string) => {
    if (!activeThread) return;
    const res = await fetch("/api/inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId: activeThread.id, text, orderAction }),
    });
    if (res.ok) {
      setReplyText("");
      showToast(orderAction ? "Order Action Executed!" : "Message Sent!");
      load();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Channel Thread List */}
      <BoutiqueCard className="lg:col-span-4 space-y-2.5">
        <div className="flex items-center gap-2 mb-2">
          <CssChatIcon className="text-maroon" />
          <h3 className="font-serif text-lg font-bold text-maroon">
            Omnichannel Inbox
          </h3>
        </div>
        {threads.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveId(t.id)}
            className={`w-full text-left rounded-2xl p-3 border transition-all ${
              activeThread?.id === t.id
                ? "bg-softpink border-maroon shadow-sm"
                : "bg-ivory/60 border-gold/25 hover:border-gold"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-charcoal">
                {t.customerName}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-maroon border border-gold/30">
                {t.channel}
              </span>
            </div>
            <p className="text-xs text-charcoal/70 truncate mt-1">
              {t.messages[t.messages.length - 1]?.text}
            </p>
          </button>
        ))}
      </BoutiqueCard>

      {/* Center: Active Chat + Quick Replies */}
      <BoutiqueCard className="lg:col-span-5 flex flex-col justify-between min-h-[380px]">
        {activeThread && (
          <>
            <div className="border-b border-gold/30 pb-3 mb-3 flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-maroon">
                  {activeThread.customerName}
                </h4>
                <p className="text-xs text-charcoal/65">
                  {activeThread.channel} • {activeThread.customerPhone}
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                Live
              </span>
            </div>

            <div className="space-y-2.5 flex-1 max-h-[220px] overflow-y-auto pr-1 mb-3">
              {activeThread.messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs ${
                    m.sender === "agent"
                      ? "ml-auto bg-maroon text-white"
                      : "bg-ivory border border-gold/35 text-charcoal"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">
                    {m.time}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Size Chart", msg: "Size Chart: S(36), M(38), L(40), XL(42)" },
                  { label: "Washing Care", msg: "Dry Clean Only recommended for Bridal/Silk wear." },
                  { label: "Return Policy", msg: "7-Day Easy Size Exchange available!" },
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => sendReply(q.msg)}
                    className="rounded-full bg-softpink px-2.5 py-1 text-[11px] font-semibold text-maroon border border-gold/35 hover:bg-gold-soft"
                  >
                    + {q.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type reply..."
                  className="flex-1 rounded-full border border-gold/40 bg-ivory px-4 py-2 text-xs outline-none"
                />
                <BoutiqueButton
                  onClick={() => replyText.trim() && sendReply(replyText)}
                  className="py-2 px-4 text-xs"
                >
                  <CssArrowIcon />
                </BoutiqueButton>
              </div>
            </div>
          </>
        )}
      </BoutiqueCard>

      {/* Right: In-Chat Order Actions */}
      <BoutiqueCard className="lg:col-span-3 space-y-3">
        <h4 className="font-serif font-bold text-maroon">
          In-Chat Order Actions
        </h4>
        {activeThread && (
          <div className="space-y-3 text-xs">
            <div className="rounded-2xl bg-softpink p-3 border border-gold/35 space-y-1">
              <p className="font-bold text-maroon">Order #{activeThread.orderNo}</p>
              <p>Amount: {formatINR(activeThread.orderAmount)}</p>
              <p>Status: <strong>{activeThread.orderStatus}</strong></p>
            </div>
            <BoutiqueButton
              variant="outline"
              onClick={() => sendReply("", "track")}
              className="w-full py-2 text-xs"
            >
              Track Order
            </BoutiqueButton>
            <BoutiqueButton
              variant="gold"
              onClick={() => sendReply("", "refund")}
              className="w-full py-2 text-xs"
            >
              Instant Refund (Razorpay)
            </BoutiqueButton>
            <button
              type="button"
              onClick={() => sendReply("", "cancel")}
              className="w-full rounded-full bg-red-50 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-100"
            >
              Cancel Order
            </button>
          </div>
        )}
      </BoutiqueCard>
    </div>
  );
}

export function IntegrationsTab() {
  const { showToast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/omnichannel");
    if (res.ok) {
      const d = await res.json();
      setIntegrations(d.integrations || []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string) => {
    const res = await fetch("/api/omnichannel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_integration", id }),
    });
    if (res.ok) {
      showToast("Integration Status Updated!");
      load();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {integrations.map((integ) => (
        <BoutiqueCard key={integ.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold">
                {integ.category}
              </span>
              <h4 className="font-serif text-lg font-bold text-maroon mt-0.5">
                {integ.name}
              </h4>
              <p className="text-xs text-charcoal/70">{integ.provider}</p>
            </div>
            <CssGearIcon className="text-maroon shrink-0" />
          </div>
          <p className="mt-3 text-xs text-charcoal/65">
            API Key: <code>{integ.apiKeyMask}</code>
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                integ.connected
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {integ.connected ? "Connected ✓" : "Disconnected"}
            </span>
            <BoutiqueButton
              variant="outline"
              onClick={() => toggle(integ.id)}
              className="py-1.5 px-3 text-xs"
            >
              {integ.connected ? "Pause" : "Connect"}
            </BoutiqueButton>
          </div>
        </BoutiqueCard>
      ))}
    </div>
  );
}
