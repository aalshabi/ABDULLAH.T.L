"use client";

import * as React from "react";
import { CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";

type GuideLauncherProps = {
  label: string;
  onOpen: () => void;
};

export const GuideLauncher = React.forwardRef<HTMLButtonElement, GuideLauncherProps>(
  function GuideLauncher({ label, onOpen }, ref) {
    return (
      <Button
        ref={ref}
        type="button"
        onClick={onOpen}
        aria-label={label}
        className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-3 z-50 size-12 rounded-full px-0 shadow-xl sm:end-6 sm:w-auto sm:px-4"
      >
        <CircleHelp className="size-5 shrink-0" aria-hidden />
        <span className="hidden sm:inline">{label}</span>
      </Button>
    );
  }
);
