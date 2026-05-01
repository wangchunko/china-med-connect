 "use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Eye, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { articles as mockArticles, type MockArticle } from "@/lib/mockArticles";

type FeedArticle = Pick<
  MockArticle,
  "id" | "title" | "tags" | "views" | "date" | "imageUrl"
> & { feedKey: string };

function formatViews(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toString();
}

function uniqueId() {
  // Use a robust unique ID to prevent duplicate key warnings during infinite append.
  // crypto.randomUUID is supported in modern browsers.
  if (globalThis.crypto && "randomUUID" in globalThis.crypto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis.crypto as any).randomUUID() as string;
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneForFeed(source: MockArticle): FeedArticle {
  return {
    ...asFeedArticle(source),
    feedKey: `feed-${uniqueId()}`,
  };
}

function asFeedArticle(source: MockArticle): FeedArticle {
  return {
    id: source.id,
    title: source.title,
    tags: source.tags,
    views: source.views,
    date: source.date,
    imageUrl: source.imageUrl,
    feedKey: `seed-${source.id}`,
  };
}

export function HealthArticles() {
  const [articles, setArticles] = useState<FeedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Populate mock data on client only to avoid SSR hydration mismatch.
    setArticles(mockArticles.slice(0, 4).map(asFeedArticle));
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    const sentinel = sentinelRef.current;
    if (!root || !sentinel) return;
    if (!isInitialized) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (isLoading) return;

        setIsLoading(true);
        window.setTimeout(() => {
          setArticles((prev) => {
            const start = prev.length;
            const next = Array.from({ length: 3 }).map((_, i) => {
              const src = mockArticles[(start + i) % mockArticles.length]!;
              return cloneForFeed(src);
            });
            return [...prev, ...next];
          });
          setIsLoading(false);
        }, 800);
      },
      { root, threshold: 0.2 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isInitialized, isLoading]);

  return (
    <section
      ref={scrollerRef}
      className="space-y-4 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:[&::-webkit-scrollbar]:hidden lg:[scrollbar-width:none] lg:[-ms-overflow-style:none]"
    >
      <header className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          健康资讯
        </h2>
        <p className="text-sm text-slate-600">
          精选科普与就医指南，帮助您更好地了解身体信号。
        </p>
      </header>

      <div className="grid gap-4">
        {!isInitialized ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-3xl bg-white ring-1 ring-slate-100 shadow-[0_10px_40px_-10px_rgba(0,128,128,0.05)]"
              >
                <div className="h-40 w-full animate-pulse bg-slate-100" />
                <div className="space-y-3 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="flex gap-2">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                  </div>
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </>
        ) : null}

        {articles.map((a) => (
          <Link key={a.feedKey} href={`/article/${a.id}`} className="block">
            <article className="group overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_24px_70px_-28px_rgba(15,23,42,0.30)]">
              <div className="relative h-40 w-full">
                <Image
                  src={a.imageUrl}
                  alt={a.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 35vw, 100vw"
                  priority={a.id === articles[0]?.id}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white">
                    {a.title}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex flex-wrap gap-2">
                  {a.tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-white/55 px-2.5 py-1 text-xs text-slate-800 backdrop-blur-md ring-1 ring-white/50"
                    >
                      <Tag className="size-3.5 text-slate-500" />
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Eye className="size-3.5 text-slate-400" />
                    {formatViews(a.views)} 阅读
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Calendar className="size-3.5 text-slate-400" />
                    {a.date}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}

        <div ref={sentinelRef} className="h-1" />

        {isLoading ? (
          <div className="flex items-center justify-center py-3 text-sm text-slate-500">
            <span className="mr-2 inline-flex size-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
            加载中...
          </div>
        ) : null}
      </div>
    </section>
  );
}

