// 3軸スコアと、書くプロセスの信号。テスト→メンター→マネージャーで共有する型。

export type Score = {
  understanding: number; // 理解度（回答の深さ）0-100
  efficiency: number; // 手を動かす効率 0-100
  reliability: number; // 信頼性＝自力度（スコアを鵜呑みにしてよいか）0-100
  comment: string; // マネージャー向け一言講評
};

// テスト画面で記録する「書くプロセス」の信号（成果物でなく過程）。
export type Signals = {
  keystrokes: number; // 打鍵で増えた文字数
  pastes: number; // ペースト検知回数
  runs: number; // 実行回数
};

// 実力軸の点を Dreyfus 5段階に変換（要件定義の閾値）。
export function dreyfus(understanding: number): string {
  if (understanding >= 85) return "達人";
  if (understanding >= 70) return "中堅";
  if (understanding >= 50) return "一人前";
  if (understanding >= 30) return "上級初心者";
  return "初心者";
}

// 信頼性が低ければ「スコアは出たが鵜呑み注意」の但し書きを添える。
export function reliabilityNote(reliability: number): string {
  if (reliability < 50) return "要確認";
  return "";
}
