import { Compass } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <div className="p-6 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Compass className="w-5 h-5 text-[#C9A84C]" />
          <span className="font-serif text-lg font-semibold text-white tracking-widest uppercase">
            Voyage <span className="text-[#C9A84C]">Luxe</span>
          </span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
