"use client";

import React from "react";
import { BoutiqueButton, BoutiqueCard } from "@/components/BoutiqueEffects";
import { CssDownloadIcon } from "@/components/CssIcons";
import type { ShopProfile } from "@/types/crm";

export function SettingsPanel({
  shopProfile,
  onChangeProfile,
  onSaveProfile,
  onDownloadBackup,
}: {
  shopProfile: ShopProfile;
  onChangeProfile: (next: ShopProfile) => void;
  onSaveProfile: (e: React.FormEvent) => void;
  onDownloadBackup: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <BoutiqueCard>
        <h3 className="font-serif text-xl font-bold text-maroon mb-4">
          Shop Profile Settings
        </h3>
        <form onSubmit={onSaveProfile} className="space-y-3">
          <input
            type="text"
            value={shopProfile.name}
            onChange={(e) =>
              onChangeProfile({ ...shopProfile, name: e.target.value })
            }
            placeholder="Shop Name"
            className="w-full rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm outline-none"
          />
          <input
            type="text"
            value={shopProfile.address}
            onChange={(e) =>
              onChangeProfile({ ...shopProfile, address: e.target.value })
            }
            placeholder="Shop Address"
            className="w-full rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm outline-none"
          />
          <input
            type="text"
            value={shopProfile.phone}
            onChange={(e) =>
              onChangeProfile({ ...shopProfile, phone: e.target.value })
            }
            placeholder="Shop Phone"
            className="w-full rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm outline-none"
          />
          <input
            type="text"
            value={shopProfile.tagline}
            onChange={(e) =>
              onChangeProfile({ ...shopProfile, tagline: e.target.value })
            }
            placeholder="Tagline"
            className="w-full rounded-full border border-gold/40 bg-ivory px-4 py-2 text-sm outline-none"
          />
          <BoutiqueButton type="submit">Save Shop Profile</BoutiqueButton>
        </form>
      </BoutiqueCard>

      <BoutiqueCard>
        <h3 className="font-serif text-xl font-bold text-maroon mb-2">
          Data Backup & Security
        </h3>
        <p className="text-xs text-charcoal/75 mb-4">
          All showroom data is securely backed up across PostgreSQL and local
          storage with strict Owner-only dashboard protection.
        </p>
        <BoutiqueButton variant="gold" onClick={onDownloadBackup}>
          <CssDownloadIcon />
          <span>Download Full JSON Backup</span>
        </BoutiqueButton>
      </BoutiqueCard>
    </div>
  );
}
