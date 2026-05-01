import Link from "next/link";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/admin/doctors", label: "医生管理" },
  { href: "/admin/content", label: "健康内容" },
  { href: "/admin/consultations", label: "问诊会话" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
        <aside className="rounded-xl border bg-sidebar p-4 text-sidebar-foreground">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              China-Med Connect
            </p>
            <h2 className="text-lg font-semibold">运营后台</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm transition hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
