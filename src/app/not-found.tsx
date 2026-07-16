import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="text-center">
        <p className="font-display text-7xl font-extrabold text-teal ltr-nums">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          الصفحة غير موجودة · Page not found
        </h1>
        <p className="mt-2 text-muted-foreground">
          الرابط الذي تبحث عنه غير متوفر. · The link you followed doesn&apos;t exist.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">العودة للرئيسية · Back home</Link>
        </Button>
      </div>
    </div>
  );
}
