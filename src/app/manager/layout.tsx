import { redirect } from "next/navigation";
import Sidebar, { type NavItem } from "../components/Sidebar";
import { getSessionUser } from "@/lib/session";

const NAV: NavItem[] = [
  { href: "/manager", label: "メンバー一覧の評価" },
  { href: "/manager/assessment", label: "実力調査" },
  { href: "/manager/project", label: "プロジェクトマネジメント" },
];

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  // マネージャー画面はマネージャーのみ。メンバーはメンバー側へ。
  if (user.role !== "manager") redirect("/member");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role="マネージャー"
        items={NAV}
        userLabel={user.displayName ?? user.email ?? undefined}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
