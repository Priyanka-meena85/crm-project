"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { CssAlertIcon, CssCheckIcon, CssDiamondIcon } from "@/components/CssIcons";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3600);
    },
    []
  );

  return (
    <SessionProvider>
      <ToastContext.Provider value={{ showToast }}>
        {children}

        <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)]">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 40, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 360, damping: 26 }}
                className={`pointer-events-auto flex items-center gap-3 rounded-full px-5 py-3.5 shadow-boutique-hover border backdrop-blur-md ${
                  toast.type === "error"
                    ? "bg-red-600 text-white border-red-400"
                    : "bg-gradient-to-r from-maroon to-maroon-light text-white border-gold-shine/60"
                }`}
              >
                {toast.type === "error" ? (
                  <CssAlertIcon className="text-white" />
                ) : toast.type === "info" ? (
                  <CssDiamondIcon className="text-gold-shine" />
                ) : (
                  <CssCheckIcon className="text-gold-shine" />
                )}
                <span className="text-sm font-medium tracking-wide">
                  {toast.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ToastContext.Provider>
    </SessionProvider>
  );
}
