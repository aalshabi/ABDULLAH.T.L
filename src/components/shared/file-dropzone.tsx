"use client";

import * as React from "react";
import Image from "next/image";
import { UploadCloud, FileText, ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ACCEPTED = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/heic"];
const MAX_BYTES = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  file,
  onFile,
  labels,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  labels: {
    dropTitle: string;
    dropHint: string;
    browse: string;
    selected: string;
    remove: string;
    formatError: string;
    sizeError: string;
  };
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreview(null);
  }, [file]);

  function validateAndSet(f: File | undefined) {
    if (!f) return;
    if (!ACCEPTED.includes(f.type) && !f.name.match(/\.(pdf|png|jpe?g|webp|heic)$/i)) {
      toast.error(labels.formatError);
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(labels.sizeError);
      return;
    }
    onFile(f);
  }

  if (file) {
    const isImage = file.type.startsWith("image/");
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-teal/10 text-teal">
          {isImage && preview ? (
            <Image src={preview} alt={file.name} width={56} height={56} className="size-14 object-cover" unoptimized />
          ) : isImage ? (
            <ImageIcon className="size-6" />
          ) : (
            <FileText className="size-6" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{file.name}</p>
          <p className="ltr-nums text-xs text-muted-foreground">
            {labels.selected} · {formatSize(file.size)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onFile(null)}
          aria-label={labels.remove}
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        validateAndSet(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
        dragging ? "border-teal bg-teal/5" : "border-border hover:border-teal/50 hover:bg-muted/40"
      )}
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-teal/10 text-teal">
        <UploadCloud className="size-7" />
      </div>
      <div>
        <p className="font-display text-base font-bold text-foreground">{labels.dropTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">{labels.dropHint}</p>
      </div>
      <Button type="button" variant="outline" size="sm" tabIndex={-1}>
        {labels.browse}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        className="hidden"
        onChange={(e) => validateAndSet(e.target.files?.[0])}
      />
    </div>
  );
}
