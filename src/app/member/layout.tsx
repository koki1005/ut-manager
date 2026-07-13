import { redirect } from "next/navigation";
import Sidebar, { type NavItem } from "../components/Sidebar";
import { getSessionUser } from "@/lib/session";

const NAV: NavItem[] = [
  { href: "/member", label: "トップ" },
  { href: "/member/test", label: "テスト" },
  { href: "/member/mentor", label: "AIメンター" },
  { href: "/member/project", label: "プロジェクト" },
  { href: "/member/messages", label: "メッセージ", soon: true },
];

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role="メンバー"
        items={NAV}
        userLabel={user.displayName ?? user.email ?? undefined}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
