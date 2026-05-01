import { listDoctorsAdminAction } from "@/actions/admin.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorListManager } from "@/components/admin/doctor-list-manager";

export const dynamic = "force-dynamic";

export default async function AdminDoctorsPage() {
  const result = await listDoctorsAdminAction();
  const doctors = result.ok ? result.data ?? [] : [];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">医生管理</h1>
        <p className="text-sm text-muted-foreground">
          维护医生的一级分类与专科标签，用于 AI 分诊匹配推荐。
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">医生列表</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {!result.ok ? (
              <p className="text-sm text-destructive">
                {result.error ?? "加载医生列表失败。"}
              </p>
            ) : null}

          <DoctorListManager
            initialDoctors={doctors.map((d) => ({
              id: d.id,
              fullName: d.fullName,
              title: d.title,
              avatarUrl: d.avatarUrl,
              primaryCategory: d.primaryCategory,
              tags: d.tags,
            }))}
          />
        </CardContent>
      </Card>
    </section>
  );
}

