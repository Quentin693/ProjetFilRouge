"use client";

import { useState } from "react";
import QRCode from "react-qr-code";
import { QrCode, Download, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReservationQrCodeProps {
  reservationId: string;
  reference: string;
  voyageTitle: string;
}

export function ReservationQrCode({
  reservationId,
  reference,
  voyageTitle,
}: ReservationQrCodeProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const token = reference.slice(0, 8).toUpperCase();

  const getNetworkUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (envUrl) return envUrl;
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "http://localhost:3000";
  };

  const baseUrl = getNetworkUrl();
  const pdfUrl = `${baseUrl}/api/reservations/${reservationId}/pdf?token=${token}`;
  const isLocalhost = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pdfUrl);
    setCopied(true);
    toast.success("Lien copié !");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="bg-[#111111] border border-[#C9A84C]/20 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center">
          <QrCode className="w-5 h-5 text-[#C9A84C]" />
        </div>
        <div>
          <h3 className="font-serif text-xl text-white">Voucher de voyage</h3>
          <p className="text-white/40 text-sm">
            Scannez depuis votre téléphone pour télécharger le PDF
          </p>
        </div>
      </div>

      {showQr ? (
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <QRCode
              value={pdfUrl}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#0D0D0D"
              level="M"
            />
          </div>

          <div className="text-center">
            <p className="text-white/60 text-sm mb-1">{voyageTitle}</p>
            <p className="text-white/30 text-xs font-mono">
              Token : <span className="text-[#C9A84C]">{token}</span>
            </p>
          </div>

          {isLocalhost ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 w-full">
              <p className="text-yellow-300 text-sm text-center leading-relaxed">
                ⚠️ Configurez <code className="text-yellow-200">NEXT_PUBLIC_APP_URL</code> avec
                votre IP locale pour scanner depuis le téléphone.
              </p>
            </div>
          ) : (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 w-full">
              <p className="text-blue-300 text-sm text-center leading-relaxed">
                📱 Pointez l&apos;appareil photo de votre téléphone vers le QR code pour
                ouvrir le PDF.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-white/10 text-white hover:bg-white/5 flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le lien
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/5 flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger PDF
            </Button>
          </div>

          <button
            onClick={() => setShowQr(false)}
            className="text-white/30 text-sm hover:text-white/60 transition-colors"
          >
            Masquer le QR code
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="bg-white p-3 rounded-xl opacity-30 blur-[2px]">
              <QRCode value={pdfUrl} size={140} bgColor="#FFFFFF" fgColor="#0D0D0D" level="M" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setShowQr(true)}
                className="bg-[#C9A84C] hover:bg-[#A07830] text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-lg"
              >
                <QrCode className="w-4 h-4 inline mr-2" />
                Afficher le QR code
              </button>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/5 flex-1"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ouvrir le PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
