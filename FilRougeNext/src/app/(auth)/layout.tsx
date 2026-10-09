import Image from "next/image";
import Link from "next/link";
import { Compass } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-[#0D0D0D]">
        {/* Logo */}
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#C9A84C]" />
            <span className="font-serif text-lg font-semibold text-white tracking-widest uppercase">
              Voyage <span className="text-[#C9A84C]">Luxe</span>
            </span>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Right - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=90&auto=format&fit=crop"
          alt="Maldives"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#0D0D0D]/20 to-[#0D0D0D]/60" />
        <div className="absolute bottom-12 left-12 right-12">
          <p className="font-serif text-3xl text-white mb-2">
            &ldquo;Le voyage est la seule chose que l&apos;on achète qui nous rende plus riche.&rdquo;
          </p>
          <p className="text-white/50 text-sm">— Anonyme</p>
        </div>
      </div>
    </div>
  );
}
