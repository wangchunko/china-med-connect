import { getDoctorsAction } from "@/actions/doctor.actions";
import { DoctorForm } from "@/components/admin/doctor-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminPage() {
  const doctorsResult = await getDoctorsAction({ limit: 20 });
  const doctors = doctorsResult.ok ? doctorsResult.data ?? [] : [];

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Doctor Management</h1>
        <p className="text-sm text-muted-foreground">
          Manage clinician profiles and sync them to the local SQLite database.
        </p>
      </header>

      {!doctorsResult.ok ? (
        <Card>
          <CardContent className="pt-6 text-sm text-destructive">
            {doctorsResult.error ?? "Failed to load doctors."}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <DoctorForm />

        <Card>
          <CardHeader>
            <CardTitle>Recent Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No doctors yet. Use the form to add your first profile.
              </p>
            ) : (
              <ul className="space-y-3">
                {doctors.map((doctor) => (
                  <li key={doctor.id} className="rounded-md border p-3">
                    <p className="font-medium">{doctor.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doctor.intlCertification}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
