import { geminiAvailable, generateJson } from "@/lib/gemini";

export const runtime = "nodejs";

// 評価一覧のメンバー（実力調査の3軸）。これを基にAIが作業を割り当てる。
type Roster = {
  name: string;
  understanding: number;
  efficiency: number;
  reliability: number;
}[];

type Assignment = { name: string; task: string; load: number; reason: string };

// キー未設定・エラー時の暫定割り当て。
const MOCK: Assignment[] = [
  { name: "佐藤", task: "コア設計・難所の実装", load: 40, reason: "理解度・自力度ともに高く、難所を任せられる。" },
  { name: "田中", task: "機能実装（レビュー必須）", load: 35, reason: "速いが自力度が低め。成果物のレビューを前提に。" },
  { name: "鈴木", task: "テスト・ドキュメント", load: 25, reason: "基礎固めの段階。負荷を抑えて着実に。" },
];

const SCHEMA = {
  type: "OBJECT",
  properties: {
    assignments: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          task: { type: "STRING" },
          load: { type: "INTEGER" },
          reason: { type: "STRING" },
        },
        required: ["name", "task", "load", "reason"],
      },
    },
  },
  required: ["assignments"],
} as const;

export async function POST(req: Request) {
  const { project, roster } = (await req.json().catch(() => ({}))) as {
    project?: string;
    roster?: Roster;
  };

  if (!geminiAvailable() || !roster?.length) {
    return Response.json({ assignments: MOCK, fallback: true });
  }

  const people = roster
    .map(
      (m) =>
        `- ${m.name}: 理解度${m.understanding} / 効率${m.efficiency} / 信頼性(自力度)${m.reliability}`,
    )
    .join("\n");

  const prompt = [
    "あなたは開発チームのマネージャーを補佐するAI。各メンバーの実力調査スコア（3軸）を基に、",
    "プロジェクトの作業を過不足なく割り当てる。次の原則に従う。",
    "- 理解度と自力度が高い人ほど、難所・コア設計など失敗が高くつくタスクを任せる。",
    "- 自力度（信頼性）が低い人は成果物のレビューを前提としたタスクに置き、単独で難所を任せない。",
    "- 効率が高い人には量のあるタスク、基礎段階の人は負荷を抑えて着実な範囲。",
    "- load（作業量%）は roster 全員の合計が概ね100になるよう配分する。",
    "各メンバーに task（担当内容）・load（整数%）・reason（割り当て理由を1文）を付ける。",
    `\n# プロジェクト要件\n${project || "(未記入。一般的な小規模開発として割り当てる)"}`,
    `\n# メンバーと実力調査スコア\n${people}`,
  ].join("\n");

  try {
    const raw = await generateJson<{ assignments: Assignment[] }>(prompt, SCHEMA);
    const assignments = (raw.assignments ?? []).map((a) => ({
      name: String(a.name ?? "").trim(),
      task: String(a.task ?? "").trim(),
      load: Math.max(0, Math.min(100, Math.round(Number(a.load) || 0))),
      reason: String(a.reason ?? "").trim(),
    }));
    return Response.json({ assignments, fallback: false });
  } catch (e) {
    return Response.json({
      assignments: MOCK,
      fallback: true,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
