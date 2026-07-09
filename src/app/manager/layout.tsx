import Sidebar, { type NavItem } from "../components/Sidebar";

const NAV: NavItem[] = [
  { href: "/manager", label: "メンバー一覧の評価" },
  { href: "/manager/assessment", label: "実力調査" },
  { href: "/manager/project", label: "プロジェクトマネジメント" },
];

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar role="マネージャー" items={NAV} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
