import { TriageChat } from "@/components/public/triage-chat";
import { HealthArticles } from "@/components/HealthArticles";

export const dynamic = "force-dynamic";

export default async function PublicGatewayPage() {
  return (
    <div className="bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:h-[calc(100vh-64px)] lg:overflow-hidden lg:py-6">
        <div className="mb-6 space-y-3 lg:mb-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            您好，我是您的智能导诊助手，
            <span className="bg-gradient-to-r from-teal-600 to-blue-500 bg-clip-text text-transparent">
              华医连
            </span>
            祝您健康。
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            用温和、清晰的方式描述症状，我们将为您提供初步建议，并推荐合适的专家方向。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:h-[calc(100%-88px)] lg:min-h-0 lg:grid-cols-12">
          <section className="order-1 lg:col-span-8 lg:h-full lg:min-h-0 lg:flex lg:flex-col">
            <TriageChat />
          </section>

          <aside className="order-2 lg:col-span-4 lg:h-full lg:min-h-0">
            <HealthArticles />
          </aside>
        </div>
      </div>
    </div>
  );
}

