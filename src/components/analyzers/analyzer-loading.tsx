"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";

export function AnalyzerLoading() {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card py-20 text-center"
    >
      <div className="relative">
        <Loader2 className="size-10 animate-spin text-teal" />
      </div>
      <p className="font-display text-lg font-bold text-foreground">{t.common.analyzing}</p>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-teal"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
