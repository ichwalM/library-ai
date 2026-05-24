import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!adminEmails.includes(session.user?.email || "")) redirect("/unauthorized");

  return (
    <div className="min-h-screen bg-neo-gray flex">
      {/* Sidebar */}
      <aside className="w-64 border-r-4 border-neo-black bg-neo-black flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b-4 border-neo-yellow">
          <Link href="/" className="block">
            <div className="font-mono font-bold text-xl text-white">
              LIBRARI<span className="text-neo-yellow">AI</span>
            </div>
            <div className="font-mono text-xs text-gray-400 mt-1">ADMIN PANEL</div>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { href: "/admin", icon: "🏠", label: "Dashboard" },
            { href: "/admin/categories", icon: "📚", label: "Kategori" },
            { href: "/admin/documents", icon: "📄", label: "Dokumen" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 font-mono font-bold text-sm text-white border-2 border-transparent hover:border-neo-yellow hover:bg-neo-yellow hover:text-neo-black transition-all duration-150"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User & Sign out */}
        <div className="p-4 border-t-4 border-neo-yellow">
          <div className="font-mono text-xs text-gray-400 mb-1 truncate">
            {session.user?.email}
          </div>
          <Link
            href="/api/auth/signout"
            className="neo-button neo-button-yellow neo-button-sm w-full justify-center"
          >
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
