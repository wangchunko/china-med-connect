import type { Metadata } from "next";
import Link from "next/link";
import { HeartPulse } from "lucide-react";

export const metadata: Metadata = {
  title: "华医连",
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-teal-50/30 via-white to-white">
      {/* Ambient mesh gradient background (no geometric pattern). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-32 size-[520px] rounded-full bg-teal-300/26 blur-[120px] mix-blend-multiply will-change-transform animate-[mesh-float-1_22s_ease-in-out_infinite]" />
        <div className="absolute -right-28 top-10 size-[560px] rounded-full bg-sky-300/24 blur-[120px] mix-blend-multiply will-change-transform animate-[mesh-float-2_26s_ease-in-out_infinite]" />
        <div className="absolute left-24 bottom-[-220px] size-[600px] rounded-full bg-violet-300/18 blur-[120px] mix-blend-multiply will-change-transform animate-[mesh-float-3_30s_ease-in-out_infinite]" />

        {/* Smaller highlight blobs for more “flow” and depth */}
        <div className="absolute left-[42%] top-[-90px] size-[360px] rounded-full bg-teal-200/22 blur-[110px] mix-blend-multiply will-change-transform animate-[mesh-float-4_34s_ease-in-out_infinite]" />
        <div className="absolute right-[18%] bottom-[-140px] size-[420px] rounded-full bg-sky-200/18 blur-[130px] mix-blend-multiply will-change-transform animate-[mesh-float-1_40s_ease-in-out_infinite]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-bold tracking-tight text-teal-600"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
              <HeartPulse className="size-4.5 text-teal-700" />
            </span>
            华医连
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              管理后台
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}

