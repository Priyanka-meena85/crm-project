"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CssAlertIcon,
  CssArrowIcon,
  CssChatIcon,
  CssCloseIcon,
  CssDiamondIcon,
  CssDocIcon,
  CssPhoneIcon,
  CssPlusIcon,
  CssSearchIcon,
  CssUserIcon,
} from "@/components/CssIcons";
import {
  BoutiqueButton,
  BoutiqueCard,
  BoutiqueModal,
  WhatsAppButton,
} from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import type {
  LeadRecord,
  LeadScore,
  LeadSource,
  LeadStage,
} from "@/lib/leads-store";

const STAGES: LeadStage[] = ["NEW", "BAAT HUI", "QUOTE", "PAKKI", "LOST"];

function ScoreBadge({ score }: { score: LeadScore }) {
  if (score === "Hot") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700 border border-red-200">
        <span className="h-2 w-2 rounded-full bg-red-600" />
        Hot
      </span>
    );
  }
  if (score === "Warm") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
        <span className="h-2 w-2 rounded-full bg-amber-500" />
        Warm
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold text-sky-800 border border-sky-200">
      <span className="h-2 w-2 rounded-full bg-sky-500" />
      Cold
    </span>
  );
}

export function LeadsWorkspace({
  mode,
  onSummaryChange,
}: {
  mode: "leads" | "pipeline" | "followups";
  onSummaryChange?: (summary: {
    todayLeads: number;
    pendingFollowups: number;
    monthlyLeads: number;
    monthlyPakki: number;
    bestSource: string;
  }) => void;
}) {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [stageFilter, setStageFilter] = useState<string>("All");
  const [scoreFilter, setScoreFilter] = useState<string>("All");

  // Modals
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null);
  const [newNote, setNewNote] = useState("");
  const [noteBy, setNoteBy] = useState("Ravi");
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState({
    naam: "",
    phone: "",
    source: "Instagram DM" as LeadSource,
    query: "",
    quote: "₹3,500",
    score: "Hot" as LeadScore,
    assigned_to: "Ravi",
    next_followup: "Aaj 5:00 PM",
  });

  // Drag & Drop
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const loadLeads = useCallback(async () => {
    const res = await fetch("/api/leads");
    if (res.ok) {
      const data = await res.json();
      setLeads(data.leads || []);
      if (data.summary && onSummaryChange) {
        onSummaryChange(data.summary);
      }
      if (selectedLead) {
        const refreshed = (data.leads || []).find(
          (l: LeadRecord) => l.id === selectedLead.id
        );
        if (refreshed) setSelectedLead(refreshed);
      }
    }
  }, [onSummaryChange, selectedLead]);

  useEffect(() => {
    loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (sourceFilter !== "All" && l.source !== sourceFilter) return false;
      if (stageFilter !== "All" && l.stage !== stageFilter) return false;
      if (scoreFilter !== "All" && l.score !== scoreFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        l.naam.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.query.toLowerCase().includes(q)
      );
    });
  }, [leads, sourceFilter, stageFilter, scoreFilter, search]);

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadForm),
    });
    if (res.ok) {
      showToast("New lead saved successfully!");
      setAddLeadOpen(false);
      setLeadForm({
        naam: "",
        phone: "",
        source: "Instagram DM",
        query: "",
        quote: "₹3,500",
        score: "Hot",
        assigned_to: "Ravi",
        next_followup: "Aaj 5:00 PM",
      });
      loadLeads();
    }
  };

  const handleUpdateLead = async (
    id: string,
    patch: {
      stage?: LeadStage;
      score?: LeadScore;
      assigned_to?: string;
      note?: string;
      kisne_baat_ki?: string;
    }
  ) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) {
      showToast(patch.stage ? `Stage → ${patch.stage}` : "Lead Updated!");
      loadLeads();
    }
  };

  return (
    <div className="space-y-5">
      {/* MODE 1: LEADS TABLE / CARDS */}
      {mode === "leads" && (
        <BoutiqueCard>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-maroon">
                Leads Management ({filteredLeads.length})
              </h3>
              <p className="text-xs text-charcoal/70">
                Kisi bhi lead par click karke poori baat-cheet history dekhein
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold flex items-center">
                  <CssSearchIcon />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Naam / Phone se dhoondo..."
                  className="rounded-full border border-gold/40 bg-ivory py-1.5 pl-9 pr-4 text-xs outline-none focus:border-maroon"
                />
              </div>
              <BoutiqueButton onClick={() => setAddLeadOpen(true)} className="py-1.5 text-xs">
                <CssPlusIcon />
                <span>Nayi Lead</span>
              </BoutiqueButton>
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs font-semibold text-maroon outline-none"
            >
              <option value="All">Source: Sabhi</option>
              {["Instagram DM", "WhatsApp", "Website", "Call", "Walk-in"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs font-semibold text-maroon outline-none"
            >
              <option value="All">Stage: Sabhi</option>
              {STAGES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="rounded-full border border-gold/40 bg-ivory px-3 py-1 text-xs font-semibold text-maroon outline-none"
            >
              <option value="All">Score: All</option>
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gold/35 text-xs uppercase text-maroon">
                  <th className="py-3 px-3">Naam & Phone</th>
                  <th className="py-3 px-3">Source & Query</th>
                  <th className="py-3 px-3">Quote</th>
                  <th className="py-3 px-3">Stage & Score</th>
                  <th className="py-3 px-3">Follow-up / Team</th>
                  <th className="py-3 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/20">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-softpink/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <p className="font-semibold text-charcoal">{lead.naam}</p>
                      <p className="text-xs text-charcoal/70">{lead.phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-ivory px-2.5 py-0.5 text-[10px] font-bold text-maroon border border-gold/35">
                        {lead.source}
                      </span>
                      <p className="text-xs text-charcoal/80 mt-1">{lead.query}</p>
                    </td>
                    <td className="py-3 px-3 font-bold text-maroon">
                      {lead.quote}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-maroon/10 px-2.5 py-0.5 text-[11px] font-bold text-maroon">
                          {lead.stage}
                        </span>
                        <ScoreBadge score={lead.score} />
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs">
                      <p className="font-semibold text-charcoal">
                        {lead.next_followup}
                      </p>
                      <p className="text-charcoal/65">Assigned: {lead.assigned_to}</p>
                    </td>
                    <td
                      className="py-3 px-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1.5">
                        <a
                          href={buildWhatsAppLink(
                            lead.phone,
                            `Namaste ${lead.naam} ji! Priya Boutique se ${lead.query} ke baare me baat karni thi.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white hover:bg-green-700"
                        >
                          <CssChatIcon />
                          WhatsApp
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="rounded-full bg-ivory p-1.5 text-maroon border border-gold/40 hover:bg-softpink inline-flex items-center"
                          title="Full History"
                        >
                          <CssDocIcon />
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

      {/* MODE 2: KANBAN PIPELINE VIEW (5 COLUMNS WITH DRAG & DROP) */}
      {mode === "pipeline" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-maroon">
              Lead card ko drag karke agle stage me daalein (NEW → BAAT HUI → QUOTE → PAKKI → LOST)
            </p>
            <BoutiqueButton onClick={() => setAddLeadOpen(true)} className="py-1.5 text-xs">
              <CssPlusIcon />
              <span>Nayi Lead</span>
            </BoutiqueButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAGES.map((stage) => {
              const stageLeads = leads.filter((l) => l.stage === stage);
              return (
                <div
                  key={stage}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedId) {
                      handleUpdateLead(draggedId, { stage });
                      setDraggedId(null);
                    }
                  }}
                  className="rounded-[24px] bg-white/85 border border-gold/35 p-3 min-h-[380px] shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between border-b border-gold/25 pb-2">
                    <span className="font-serif text-sm font-bold text-maroon">
                      {stage}
                    </span>
                    <span className="rounded-full bg-softpink px-2.5 py-0.5 text-xs font-bold text-maroon">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    {stageLeads.map((lead) => (
                      <motion.div
                        layout
                        key={lead.id}
                        draggable
                        onDragStart={() => setDraggedId(lead.id)}
                        onClick={() => setSelectedLead(lead)}
                        whileHover={{ y: -3 }}
                        className="cursor-grab active:cursor-grabbing rounded-2xl bg-ivory p-3 border border-gold/35 shadow-sm hover:border-maroon space-y-1.5"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="font-semibold text-xs text-charcoal">
                            {lead.naam}
                          </p>
                          <ScoreBadge score={lead.score} />
                        </div>
                        <p className="text-[11px] text-charcoal/75 line-clamp-2">
                          {lead.query}
                        </p>
                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="font-bold text-maroon">{lead.quote}</span>
                          <span className="text-charcoal/65">{lead.assigned_to}</span>
                        </div>
                        <div
                          className="flex flex-wrap gap-1 pt-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {STAGES.filter((s) => s !== stage)
                            .slice(0, 2)
                            .map((nextSt) => (
                              <button
                                key={nextSt}
                                type="button"
                                onClick={() =>
                                  handleUpdateLead(lead.id, { stage: nextSt })
                                }
                                className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-maroon border border-gold/35 hover:bg-softpink"
                              >
                                → {nextSt}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: FOLLOW-UPS & REMINDERS */}
      {mode === "followups" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Missed Follow-ups */}
          <BoutiqueCard className="border-red-300 bg-red-50/50">
            <div className="flex items-center gap-2 mb-3">
              <CssAlertIcon className="text-red-600" />
              <h3 className="font-serif text-lg font-bold text-red-700">
                Missed Follow-ups (Kal Karna Tha)
              </h3>
            </div>
            <div className="space-y-3">
              {leads
                .filter((l) => l.followup_status === "Missed")
                .map((l) => (
                  <div
                    key={l.id}
                    className="rounded-2xl bg-white p-3.5 border border-red-200 space-y-2"
                  >
                    <p className="font-bold text-sm text-charcoal">{l.naam}</p>
                    <p className="text-xs text-charcoal/75">{l.query}</p>
                    <div className="flex gap-2">
                      <a
                        href={`tel:${l.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white"
                      >
                        <CssPhoneIcon />
                        Call Karo
                      </a>
                      <WhatsAppButton
                        label="WhatsApp"
                        href={buildWhatsAppLink(l.phone, `Namaste ${l.naam} ji!`)}
                        className="py-1 px-3 text-xs"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </BoutiqueCard>

          {/* Quote 3 Din Purana */}
          <BoutiqueCard className="border-amber-300 bg-amber-50/50">
            <div className="flex items-center gap-2 mb-3">
              <CssDocIcon className="text-amber-700" />
              <h3 className="font-serif text-lg font-bold text-amber-900">
                Quote Bheje 3 Din Ho Gaye
              </h3>
            </div>
            <div className="space-y-3">
              {leads
                .filter((l) => l.followup_status === "Quote3Days")
                .map((l) => (
                  <div
                    key={l.id}
                    className="rounded-2xl bg-white p-3.5 border border-amber-200 space-y-2"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-sm text-charcoal">{l.naam}</p>
                      <span className="text-xs font-bold text-maroon">{l.quote}</span>
                    </div>
                    <p className="text-xs text-charcoal/75">{l.query}</p>
                    <WhatsAppButton
                      label="Follow-up Karo"
                      href={buildWhatsAppLink(
                        l.phone,
                        `Namaste ${l.naam} ji! Aapko ${l.quote} ka quote bheja tha, kya hum order confirm karein?`
                      )}
                      className="py-1 px-3 text-xs"
                    />
                  </div>
                ))}
            </div>
          </BoutiqueCard>

          {/* Aaj Ki Calls */}
          <BoutiqueCard>
            <div className="flex items-center gap-2 mb-3">
              <CssUserIcon className="text-maroon" />
              <h3 className="font-serif text-lg font-bold text-maroon">
                Aaj Kisko Call Karna Hai
              </h3>
            </div>
            <div className="space-y-3">
              {leads
                .filter((l) => l.followup_status === "Today")
                .map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="cursor-pointer rounded-2xl bg-ivory/80 p-3.5 border border-gold/35 space-y-2 hover:border-maroon"
                  >
                    <div className="flex justify-between">
                      <p className="font-bold text-sm text-charcoal">{l.naam}</p>
                      <span className="text-xs font-bold text-maroon">
                        {l.next_followup}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/75">
                      {l.query} • Assigned: {l.assigned_to}
                    </p>
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={`tel:${l.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-maroon px-3 py-1 text-xs font-bold text-white"
                      >
                        <CssPhoneIcon />
                        Call Now
                      </a>
                      <WhatsAppButton
                        label="WhatsApp"
                        href={buildWhatsAppLink(l.phone, `Namaste ${l.naam} ji!`)}
                        className="py-1 px-3 text-xs"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </BoutiqueCard>
        </div>
      )}

      {/* LEAD DETAIL & HISTORY MODAL */}
      <BoutiqueModal
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={`Lead History — ${selectedLead?.naam || ""}`}
      >
        {selectedLead && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-softpink p-3.5 border border-gold/35 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-maroon">
                  {selectedLead.naam} ({selectedLead.phone})
                </span>
                <ScoreBadge score={selectedLead.score} />
              </div>
              <p>
                Source: <strong>{selectedLead.source}</strong> • Quote:{" "}
                <strong>{selectedLead.quote}</strong>
              </p>
              <p>Query: {selectedLead.query}</p>
              <p>
                Next Follow-up: <strong>{selectedLead.next_followup}</strong>
              </p>
            </div>

            {/* Assign & Score Controls */}
            <div className="grid grid-cols-3 gap-2">
              <select
                value={selectedLead.stage}
                onChange={(e) =>
                  handleUpdateLead(selectedLead.id, {
                    stage: e.target.value as LeadStage,
                  })
                }
                className="rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-semibold text-maroon outline-none"
              >
                {STAGES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <select
                value={selectedLead.score}
                onChange={(e) =>
                  handleUpdateLead(selectedLead.id, {
                    score: e.target.value as LeadScore,
                  })
                }
                className="rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-semibold text-maroon outline-none"
              >
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>

              <select
                value={selectedLead.assigned_to}
                onChange={(e) =>
                  handleUpdateLead(selectedLead.id, {
                    assigned_to: e.target.value,
                  })
                }
                className="rounded-full border border-gold/40 bg-white px-3 py-1.5 text-xs font-semibold text-maroon outline-none"
              >
                {["Ravi", "Neha", "Raju", "Pooja", "Priya"].map((tm) => (
                  <option key={tm} value={tm}>
                    {tm}
                  </option>
                ))}
              </select>
            </div>

            {/* History Timeline */}
            <div>
              <h4 className="font-serif font-bold text-sm text-maroon mb-2">
                Baat-Cheet History (Staff badle par history safe)
              </h4>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {selectedLead.history.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-2xl bg-white p-2.5 border border-gold/25 text-xs"
                  >
                    <div className="flex justify-between font-bold text-maroon">
                      <span>{h.kisne_baat_ki}</span>
                      <span className="text-charcoal/60">{h.date}</span>
                    </div>
                    <p className="text-charcoal/85 mt-0.5">{h.kya_baat_hui}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newNote.trim()) return;
                handleUpdateLead(selectedLead.id, {
                  note: newNote,
                  kisne_baat_ki: noteBy,
                });
                setNewNote("");
              }}
              className="flex gap-2"
            >
              <select
                value={noteBy}
                onChange={(e) => setNoteBy(e.target.value)}
                className="rounded-full border border-gold/40 bg-white px-2.5 py-1.5 text-xs font-semibold text-maroon"
              >
                {["Ravi", "Neha", "Raju", "Pooja"].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Kya baat hui? Note likhein..."
                className="flex-1 rounded-full border border-gold/40 bg-white px-3.5 py-1.5 text-xs outline-none"
              />
              <BoutiqueButton type="submit" className="py-1.5 px-4 text-xs">
                Save
              </BoutiqueButton>
            </form>
          </div>
        )}
      </BoutiqueModal>

      {/* ADD LEAD MODAL */}
      <BoutiqueModal
        open={addLeadOpen}
        onClose={() => setAddLeadOpen(false)}
        title="Nayi Lead Add Karein"
      >
        <form onSubmit={handleCreateLead} className="space-y-3">
          <input
            type="text"
            required
            placeholder="Customer Naam *"
            value={leadForm.naam}
            onChange={(e) => setLeadForm((f) => ({ ...f, naam: e.target.value }))}
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <input
            type="tel"
            required
            placeholder="Phone Number *"
            value={leadForm.phone}
            onChange={(e) => setLeadForm((f) => ({ ...f, phone: e.target.value }))}
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={leadForm.source}
              onChange={(e) =>
                setLeadForm((f) => ({ ...f, source: e.target.value as LeadSource }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            >
              {["Instagram DM", "WhatsApp", "Website", "Call", "Walk-in"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={leadForm.score}
              onChange={(e) =>
                setLeadForm((f) => ({ ...f, score: e.target.value as LeadScore }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            >
              <option value="Hot">Hot</option>
              <option value="Warm">Warm</option>
              <option value="Cold">Cold</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Query (e.g. Red Lehenga M Size)"
            value={leadForm.query}
            onChange={(e) => setLeadForm((f) => ({ ...f, query: e.target.value }))}
            className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Quote (e.g. ₹15,000)"
              value={leadForm.quote}
              onChange={(e) => setLeadForm((f) => ({ ...f, quote: e.target.value }))}
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            />
            <select
              value={leadForm.assigned_to}
              onChange={(e) =>
                setLeadForm((f) => ({ ...f, assigned_to: e.target.value }))
              }
              className="w-full rounded-full border border-gold/40 bg-white px-4 py-2 text-sm outline-none"
            >
              {["Ravi", "Neha", "Raju", "Pooja"].map((tm) => (
                <option key={tm} value={tm}>
                  Assign: {tm}
                </option>
              ))}
            </select>
          </div>
          <BoutiqueButton type="submit" className="w-full">
            Save Lead
          </BoutiqueButton>
        </form>
      </BoutiqueModal>
    </div>
  );
}

/* 24x7 Hinglish AI Chatbot Floating Widget */
export function HinglishAIChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { id: string; sender: "bot" | "user"; text: string }[]
  >([
    {
      id: "b1",
      sender: "bot",
      text: "Namaste! Main Priya Boutique ka 24x7 AI Assistant hoon. Hindi, English ya Hinglish me kuch bhi poochein (Lehenga price, Kurti size, Diwali Offer, ya Order Status)!",
    },
  ]);

  const replyFor = (q: string) => {
    const low = q.toLowerCase();
    if (low.includes("lehenga") || low.includes("rate") || low.includes("price")) {
      return "Hamare Bridal Red Lehenga ₹15,000 se start hain aur Red Kurti ₹1,200 me available hai. VIP customers ko 20% Diwali OFF mil raha hai!";
    }
    if (low.includes("size") || low.includes("kurti")) {
      return "Size Chart: S (36), M (38), L (40), XL (42), XXL (44). Custom blouse & alteration stitching 3 din me ready ho jati hai!";
    }
    if (low.includes("offer") || low.includes("diwali")) {
      return "Diwali Special Offer: Sabhi VIP aur returning customers ko flat 20% OFF + Free Alteration mil raha hai. Aap apna number dein, hum catalog WhatsApp kar dete hain!";
    }
    return "Bilkul! Aapka sawal note kar liya hai. Hamari team (Ravi / Neha) 5 minute me aapko WhatsApp par details share karegi. Kya main aapka phone number save kar loon?";
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { id: `u-${Date.now()}`, sender: "user" as const, text };
    const botMsg = {
      id: `b-${Date.now() + 1}`,
      sender: "bot" as const,
      text: replyFor(text),
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  return (
    <>
      <motion.button
        type="button"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 left-4 z-50 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-maroon to-maroon-light px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-boutique-hover border border-gold-shine/60"
      >
        <CssDiamondIcon className="text-gold-shine" />
        <span>24x7 AI Assistant</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            className="fixed bottom-20 left-5 z-50 w-[330px] max-w-[calc(100vw-2.5rem)] rounded-[28px] bg-ivory border border-gold/60 shadow-boutique-hover overflow-hidden"
          >
            <div className="bg-gradient-to-r from-maroon to-maroon-light text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CssDiamondIcon className="text-gold-shine" />
                <div>
                  <p className="font-serif font-bold text-sm">
                    Priya AI Assistant (24x7)
                  </p>
                  <p className="text-[10px] text-gold-soft">
                    Hindi • English • Hinglish
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-white/15"
              >
                <CssCloseIcon />
              </button>
            </div>

            <div className="p-3.5 space-y-2.5 max-h-64 overflow-y-auto">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                    m.sender === "user"
                      ? "ml-auto bg-maroon text-white"
                      : "bg-white border border-gold/35 text-charcoal"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="px-3 pb-2 flex flex-wrap gap-1">
              {["Lehenga Rate?", "Size Chart?", "Diwali Offer?"].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="rounded-full bg-softpink px-2.5 py-0.5 text-[10px] font-bold text-maroon border border-gold/35"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-2.5 border-t border-gold/30 flex gap-2 bg-white/70"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hinglish me poochein..."
                className="flex-1 rounded-full border border-gold/40 bg-ivory px-3 py-1.5 text-xs outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-maroon p-2 text-white hover:bg-maroon-light inline-flex items-center justify-center"
              >
                <CssArrowIcon />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
