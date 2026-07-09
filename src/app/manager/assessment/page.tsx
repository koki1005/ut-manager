import Topbar from "../../components/Topbar";

export default function AssessmentPage() {
  return (
    <>
      <Topbar title="実力調査" switchHref="/member" switchLabel="メンバー画面へ" />
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-4 border-l-2 border-accent pl-3">
          <h2 className="font-semibold">テスト設定</h2>
          <p className="text-sm text-muted">
            お題・質問・評価項目を設定して発表する。（保存は #8 で接続）
          </p>
        </div>

        <div className="space-y-5 border border-border bg-surface p-5">
          <label className="block">
            <span className="text-sm font-medium">モード</span>
            <select className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm">
              <option>プロジェクト型（人員配置）</option>
              <option>新卒採用型（採用診断）</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">お題</span>
            <textarea
              rows={3}
              defaultValue="時系列ログ配列から直近N分間のエラー率を返す関数 errorRate(logs, now, minutes) を実装せよ。"
              className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">深掘り質問</span>
            <textarea
              rows={2}
              defaultValue="なぜその計算量を選んだ? ログ0件のときどう振る舞う?"
              className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm"
            />
          </label>

          <div>
            <span className="text-sm font-medium">評価項目</span>
            <div className="mt-1 space-y-2">
              {["理解度（地力度）", "手を動かす効率", "信頼性（自力度）"].map((v) => (
                <input
                  key={v}
                  defaultValue={v}
                  className="w-full border border-border bg-background px-3 py-2 text-sm"
                />
              ))}
              <button className="border border-accent px-3 py-1.5 text-sm text-accent hover:bg-accent/10">
                ＋ 評価項目を追加
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button className="border border-border px-4 py-2 text-sm hover:border-accent">
              下書き保存
            </button>
            <button className="bg-accent px-4 py-2 text-sm font-medium text-accent-fg hover:opacity-90">
              メンバーへ発表
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
