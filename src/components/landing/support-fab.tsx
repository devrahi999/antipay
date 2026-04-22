'use client';

import { useState } from "react";
import { MessageCircle, X, Facebook, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function SupportFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'global');
  }, [db]);

  const { data: settings } = useDoc(settingsRef);

  const supportOptions = [
    {
      label: "Facebook Support",
      subLabel: "Chat via Messenger",
      icon: Facebook,
      color: "bg-blue-600",
      href: settings?.facebookUrl || "https://facebook.com"
    },
    {
      label: "WhatsApp Support",
      subLabel: "Instant Response",
      icon: Phone,
      color: "bg-green-500",
      href: settings?.whatsappUrl || "https://wa.me/880"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-4">
      {/* Support Options */}
      <div className={cn(
        "flex flex-col gap-3 transition-all duration-300 transform origin-bottom",
        isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-10 pointer-events-none"
      )}>
        {supportOptions.map((option, idx) => (
          <a
            key={idx}
            href={option.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-card border shadow-xl rounded-full pl-6 pr-2 py-2 group hover:border-primary transition-colors"
          >
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold leading-none">{option.label}</span>
              <span className="text-[10px] text-muted-foreground">{option.subLabel}</span>
            </div>
            <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white", option.color)}>
              <option.icon size={20} />
            </div>
          </a>
        ))}
      </div>

      {/* Main Toggle Button */}
      <div className="relative">
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-25 pointer-events-none" />
        )}
        <Button
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-2xl transition-all duration-300 relative z-10",
            isOpen ? "bg-destructive hover:bg-destructive/90 rotate-90" : "bg-primary hover:bg-primary/90"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        </Button>
      </div>
    </div>
  );
}
