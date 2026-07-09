import Sidebar, { type NavItem } from "../components/Sidebar";

const NAV: NavItem[] = [
  { href: "/member", label: "トップ" },
  { href: "/member/test", label: "テスト" },
  { href: "/member/mentor", label: "AIメンター" },
  { href: "/member/project", label: "プロジェクト" },
  { href: "/member/messages", label: "メッセージ", soon: true },
];

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="メンバー" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
