import Topbar from "../../components/Topbar";

export default function MemberProjectPage() {
  return (
    <>
      <Topbar title="プロジェクト" switchHref="/manager" switchLabel="マネージャー画面へ" />
      <div className="p-6">
        <div className="mb-4 flex items-center gap-2 border-l-2 border-accent pl-3">
          <div>
            <h2 className="font-semibold">割り振られた仕事</h2>
            <p className="text-sm text-muted">
              進めて提出する。作業中はAIが過程を見守る。
            </p>
          </div>
          <span className="ml-auto border border-accent px-2 py-0.5 text-xs text-accent">
            フェーズ2
          </span>
        </div>

        <div className="border border-border bg-surface p-5">
          <div className="text-xs text-muted">担当タスク</div>
          <div className="mt-1 font-semibold">コア設計・難所の実装（作業量 40%）</div>
          <p className="mt-2 text-sm text-muted">
            期限内でコード／資料／設計を進めて提出。まるまるAIに任せたか、自力でみっちりやったかも評価対象。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="border border-border px-4 py-2 text-sm hover:border-accent">
              作業を始める
            </button>
            <button className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90">
              提出
            </button>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          遂行中のAI常時監視・バグ早期発見・手直し申請・再分配は #23 #24。GitHub連携は #25。
        </p>
      </div>
    </>
  );
}
