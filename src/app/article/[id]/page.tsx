"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, Eye, User } from "lucide-react";
import { use } from "react";

import { articles as mockArticles } from "@/lib/mockArticles";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const article =
    mockArticles.find((a) => a.id === resolvedParams.id) ?? mockArticles[0]!;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl ring-1 ring-white/50 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]"
        >
          ← 返回上一页
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_24px_70px_-28px_rgba(15,23,42,0.30)]">
        <div className="relative w-full h-[30vh] min-h-[250px] max-h-[400px] overflow-hidden rounded-b-3xl">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 900px, 100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
        </div>

        <div className="px-6 pb-10 pt-6 md:px-10">
          <h1 className="mt-8 mb-4 text-3xl font-bold text-slate-900 tracking-tight md:text-4xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-4 text-slate-400" />
              {article.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4 text-slate-400" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="size-4 text-slate-400" />
              {article.views.toLocaleString()} 阅读
            </span>
          </div>

          <div className="mt-8">
            {article.content.map((p, idx) => (
              <p
                key={idx}
                className="mb-6 text-lg text-slate-700 leading-relaxed tracking-wide"
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

