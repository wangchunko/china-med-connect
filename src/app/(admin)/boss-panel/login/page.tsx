"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";

export default function BossPanelLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/boss-panel";
  const [key, setKey] = useState("");

  const isLocalhost = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
    );
  }, []);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl bg-white/70 p-7 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)]">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-teal-50 ring-1 ring-teal-100">
            <KeyRound className="size-5 text-teal-700" />
          </span>
          <div>
            <div className="text-lg font-bold tracking-tight text-slate-900">
              BOSS 面板登录
            </div>
            <div className="text-sm text-slate-600">
              输入密钥后可访问 `/boss-panel`
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium text-slate-700">访问密钥</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="BOSS_PANEL_KEY"
            className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm text-slate-900 backdrop-blur-md ring-1 ring-white/60 shadow-inner shadow-slate-900/5 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <p className="text-xs text-slate-500">
            {isLocalhost
              ? "本地开发环境：你可以在 .env 里设置 BOSS_PANEL_KEY，然后在此输入同样的值。"
              : "生产环境请使用正式登录方案（当前为最小可用的本地保护）。"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-full px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            返回首页
          </button>
          <button
            type="button"
            onClick={() => {
              // Set cookie for middleware verification.
              document.cookie = `boss_panel_auth=${encodeURIComponent(
                key
              )}; Path=/; SameSite=Lax`;
              router.replace(next);
              router.refresh();
            }}
            className="inline-flex h-11 items-center justify-center rounded-full bg-teal-600 px-6 text-sm font-semibold text-white shadow-[0_16px_40px_-22px_rgba(13,148,136,0.55)] transition-all duration-300 ease-in-out hover:scale-[1.01] hover:bg-teal-700"
          >
            登录进入
          </button>
        </div>
      </div>
    </div>
  );
}

