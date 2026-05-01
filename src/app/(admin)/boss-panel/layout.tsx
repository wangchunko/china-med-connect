import Link from "next/link";

type AdminLayoutProps = {
  children: React.ReactNode;
};

const navItems = [
  { href: "/boss-panel/doctors", label: "专家管理" },
  { href: "/boss-panel/content", label: "内容管理" },
  { href: "/boss-panel/consultations", label: "对话会话" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-4 md:grid-cols-[240px_1fr] md:p-6">
        <aside className="rounded-xl border bg-sidebar p-4 text-sidebar-foreground">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              灵犀智问
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
