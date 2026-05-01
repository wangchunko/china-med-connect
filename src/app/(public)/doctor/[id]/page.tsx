import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { UserRound } from "lucide-react";

import { prisma } from "@/lib/prisma";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIConsultationRoom } from "@/components/public/ai-consultation-room";
import { DoctorConsultCTA } from "@/components/public/doctor-consult-cta";

const doctorIdParamSchema = z.object({
  id: z.string().min(1),
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DoctorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const parsed = doctorIdParamSchema.safeParse({ id });
  if (!parsed.success) notFound();

  let doctor:
    | {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        title: string | null;
        hospital: string;
        experienceYears: number;
        bio: string;
        specialtyDesc: string;
        consultationFee: number;
        profile: string;
        intlCertification: string;
        techAdvantages: string;
      }
    | null = null;

  try {
    doctor = await prisma.doctor.findUnique({
      where: { id: parsed.data.id },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        title: true,
        hospital: true,
        experienceYears: true,
        bio: true,
        specialtyDesc: true,
        consultationFee: true,
        profile: true,
        intlCertification: true,
        techAdvantages: true,
      },
    });
  } catch (error) {
    console.error("DoctorProfilePage: failed to fetch doctor:", error);
    doctor = null;
  }

  if (!doctor) notFound();

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-xl ring-1 ring-white/50 shadow-[0_14px_40px_-26px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)]"
        >
          ← 返回首页
        </Link>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white/40 bg-white/60 backdrop-blur-xl shadow-[0_24px_70px_-28px_rgba(15,23,42,0.28)]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-sky-500/12 to-violet-500/10" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-5">
                <div className="relative size-20 shrink-0 md:size-24">
                  <span className="absolute inset-[-6px] rounded-full bg-white/40 blur-[2px] animate-[breathe-ring_2.8s_ease-in-out_infinite]" />
                  <div className="relative size-full overflow-hidden rounded-full ring-1 ring-white/60 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)]">
                    {doctor.avatarUrl ? (
                      <Image
                        src={doctor.avatarUrl}
                        alt={doctor.fullName}
                        fill
                        className="object-cover"
                        sizes="96px"
                        priority
                      />
                    ) : (
                      <div className="grid size-full place-items-center bg-gradient-to-br from-teal-500/20 via-white to-sky-500/15">
                        <UserRound className="size-10 text-teal-700/70" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                    {doctor.fullName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 backdrop-blur-md ring-1 ring-white/50">
                      {doctor.title || "执业医师"}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="font-medium text-slate-700">
                      {doctor.hospital || "三甲医院"}
                    </span>
                  </div>
                  {doctor.intlCertification ? (
                    <p className="text-sm text-slate-500">
                      {doctor.intlCertification}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-white/40 bg-white/55 p-4 backdrop-blur-md md:min-w-[360px]">
                {[
                  { k: "从业年限", v: `${doctor.experienceYears || 8}年+` },
                  { k: "好评率", v: "99.8%" },
                  { k: "服务人次", v: "1.2万+" },
                ].map((item) => (
                  <div key={item.k} className="text-center">
                    <div className="text-xs text-slate-500">{item.k}</div>
                    <div className="mt-1 text-base font-semibold text-slate-900">
                      {item.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)] p-6">
            <div className="text-base font-bold text-slate-900">擅长领域</div>
            <p className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
              {doctor.specialtyDesc || doctor.techAdvantages || doctor.profile}
            </p>
          </div>

          <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.22)] p-6">
            <div className="text-base font-bold text-slate-900">个人简介</div>
            <p className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
              {doctor.bio || doctor.profile}
            </p>
          </div>
        </div>

        <div id="consult">
          <AIConsultationRoom doctorId={doctor.id} doctorName={doctor.fullName} />
        </div>
      </div>

      <DoctorConsultCTA consultationFee={doctor.consultationFee || 49} />
    </div>
  );
}

