"use client";

import { useCallback } from "react";

type Props = {
  consultationFee: number;
};

export function DoctorConsultCTA({ consultationFee }: Props) {
  const onConsult = useCallback(() => {
    const container = document.getElementById("consult");
    container?.scrollIntoView({ behavior: "smooth", block: "start" });

    // Focus the first textarea inside the consultation room after scrolling.
    window.setTimeout(() => {
      const textarea =
        container?.querySelector<HTMLTextAreaElement>("textarea") ??
        document.querySelector<HTMLTextAreaElement>("#consult textarea");
      textarea?.focus();
    }, 250);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30">
      <div className="mx-auto w-full max-w-7xl px-4 pb-4">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/70 px-5 py-4 backdrop-blur-xl shadow-[0_24px_70px_-28px_rgba(15,23,42,0.30)]">
          <div className="leading-tight">
            <div className="text-xs text-slate-500">咨询价格</div>
            <div className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              ¥{consultationFee}{" "}
              <span className="text-sm font-semibold text-slate-500">/ 次</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onConsult}
            className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-base font-semibold text-white shadow-[0_16px_40px_-22px_rgba(13,148,136,0.55)] transition-all duration-300 ease-in-out hover:scale-[1.01] hover:bg-teal-700"
          >
            立即咨询
          </button>
        </div>
      </div>
    </div>
  );
}

