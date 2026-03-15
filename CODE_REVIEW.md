# コードレビュー: Pokemon Custom Battle Simulator

## 1. 概要

| 項目 | 内容 |
|------|------|
| プロジェクト名 | pokemon-custom-battle-simulator |
| 言語 / ランタイム | JavaScript (Node.js) |
| テストフレームワーク | Jest |
| テスト結果 | 5 suites / 55 tests — 全て PASS |
| ソースファイル数 | 7 (src/) |
| テストファイル数 | 5 (tests/) |

### ファイル構成

```
src/
├── types.js        — タイプ定義・相性表・倍率計算
├── pokemon.js      — Pokemonクラス（ステータス計算・状態管理）
├── moves.js        — 技定義・バリデーション
├── damage.js       — ダメージ計算エンジン
├── battle.js       — バトルシステム（ターン制御・勝敗判定）
├── teambuilder.js  — 図鑑・チーム構築・バリデーション
└── index.js        — 公開API統合エクスポート
tests/
├── types.test.js
├── pokemon.test.js
├── moves.test.js
├── damage.test.js
└── teambuilder.test.js
```

---

## 2. 良い点

### 2.1 設計・構造
- **モジュール分離が明確**: タイプ・技・ポケモン・ダメージ・バトルが各々独立しており、単一責任原則に沿っている
- **公式準拠のステータス計算**: HP計算式・性格補正・努力値/個体値の反映が本家ゲームの公式に忠実
- **25種全性格を網羅**: `getNatureModifiers()` に全性格が定義されている

### 2.2 バトルロジック
- **優先度制御が正しい**: `determineOrder()` で交代 > 優先度 > 素早さの順で正しく行動順を決定
- **タイプ相性表が包括的**: 18タイプ全ての攻撃側相性が定義済み
- **状態異常の免疫処理が適切**: 炎タイプはやけど無効、毒/鋼タイプはどく無効など

### 2.3 テスト
- **テストが構造化されている**: `describe` ブロックで論理的にグループ化
- **ランダム性を制御可能**: `fixedRandom`, `noCrit`, `forceCrit` オプションによりテストの決定性を保証
- **ヘルパー関数の活用**: `createTestPokemon()`, `createAttacker()` で重複を排除

---

## 3. バグ・不具合

### 3.1 [重大] accuracy / evasion の `getEffectiveStat()` が未定義値を返す

**ファイル**: `src/pokemon.js:106`

```javascript
getEffectiveStat(stat) {
  // ...
  return Math.floor(this.stats[stat] * multiplier);
}
```

`this.stats` には `accuracy` や `evasion` プロパティが存在しない（`calculateStats()` で生成されない）ため、`this.stats['accuracy']` は `undefined` となり、`Math.floor(undefined * multiplier)` は `NaN` を返す。

`battle.js:121-123` で命中判定に使用されるが、`|| 1` のフォールバックがあるため即座にクラッシュはしない。しかし `getEffectiveStat` 自体の戻り値が `NaN` であることは設計上の問題。

**修正案**:
```javascript
getEffectiveStat(stat) {
  const stage = this.statModifiers[stat];
  let multiplier;
  if (stat === 'accuracy' || stat === 'evasion') {
    // accuracy/evasion はbase statを持たないので倍率だけ返す
    if (stat === 'accuracy') {
      multiplier = stage >= 0 ? (3 + stage) / 3 : 3 / (3 - stage);
    } else {
      multiplier = stage >= 0 ? 3 / (3 + stage) : (3 - stage) / 3;
    }
    return multiplier; // 0段階なら1.0を返す
  }
  multiplier = stage >= 0 ? (2 + stage) / 2 : 2 / (2 - stage);
  return Math.floor(this.stats[stat] * multiplier);
}
```

### 3.2 [重大] `canMove()` で混乱・ひるみのログがバトル側と整合しない

**ファイル**: `src/pokemon.js:181-186`

`canMove()` は `boolean` を返すだけだが、`battle.js:112-113` ではひるみと混乱を `canMove()` が `false` を返した後に `volatileStatus` を確認してログを出す。しかし `canMove()` 内ですでに `flinch` を `delete` しているため、バトル側の `volatileStatus.has('flinch')` チェックは常に `false` になり、ひるみ時のログが出力されない。

```javascript
// pokemon.js:182-185 — flinchをdeleteした後にfalseを返す
if (this.volatileStatus.has('flinch')) {
  this.volatileStatus.delete('flinch');  // ← ここで削除済み
  return false;
}

// battle.js:113 — この条件は常にfalseになる
else if (attacker.volatileStatus.has('flinch'))
  this.addLog(`${attacker.name} flinched and couldn't move!`);
```

**修正案**: `canMove()` が失敗理由を返すか、ログ出力を `canMove()` 側に移す。

### 3.3 [中] 同じ問題が混乱にも存在する

`canMove()` で混乱チェック (`Math.random() < 0.33`) が `true` → `false` を返す場合、`battle.js:112` の条件分岐で `attacker.volatileStatus.has('confusion')` は `true` だがログが出る。ただし、麻痺チェック等が先に評価されるため、混乱以外の理由で動けなかった場合でも混乱のログが誤って出る可能性がある。

---

## 4. 設計上の懸念

### 4.1 [中] `Math.random()` がモック不可能な形で直接使用されている

**影響ファイル**: `src/pokemon.js`, `src/damage.js`, `src/battle.js`

`Math.random()` が多数の箇所でハードコードされており、以下の問題がある:
- バトルの再現性がない（同じ入力でも結果が異なる）
- テストで命中/回避・状態異常・混乱・ひるみ等のランダム要素を検証できない
- `battle.test.js` が存在しないのは、このランダム性に起因する可能性が高い

**修正案**: RNG（乱数生成器）をコンストラクタで注入可能にする。
```javascript
class Battle {
  constructor(team1, team2, options = {}) {
    this.rng = options.rng || Math.random;
    // ...
  }
}
```

### 4.2 [中] `toxicCounter` がクラス外で動的に追加される

**ファイル**: `src/battle.js:261`

```javascript
if (!pokemon.toxicCounter) pokemon.toxicCounter = 1;
```

`toxicCounter` は `Pokemon` クラスのコンストラクタで定義されておらず、`Battle` クラスが外部からプロパティを追加している。これは以下の問題を引き起こす:
- `Pokemon` クラスの `clearStatus()` でリセットされない
- 毒が治った後に再度毒状態になると、前回のカウンタが残る

**修正案**: `Pokemon` コンストラクタで `this.toxicCounter = 0` を初期化し、`clearStatus()` でリセットする。

### 4.3 [低] Protect の連続使用制限がない

本家ゲームでは `Protect` を連続で使うと成功率が下がる（1/3 → 1/9 → ...）が、現在の実装では毎ターン 100% 成功する。バランスに大きく影響する。

### 4.4 [低] 天候の効果が未実装

`setWeather()` / `weatherTurns` のインフラはあるが、天候がダメージ計算に影響を与えるロジックが存在しない（晴れ時の炎1.5倍、雨時の水1.5倍など）。

---

## 5. コード品質

### 5.1 [低] `switch` 文内での `const` 宣言

**ファイル**: `src/battle.js:166, 174`

```javascript
case 'heal':
  const healed = attacker.heal(...);  // ブロックスコープなしのconst
  break;
case 'hazard':
  const targetSide = ...;             // 同上
  break;
```

`switch` の `case` 内で `const` / `let` を使うとスコープが `switch` ブロック全体に漏れる。各 `case` を `{}` で囲むべき。

現状で動作はするが、将来 case を追加した際に `SyntaxError` (identifier already declared) になるリスクがある。

### 5.2 [低] ステルスロックのダメージがタイプ相性を無視している

**ファイル**: `src/battle.js:222`

```javascript
const damage = Math.floor(pokemon.stats.hp * 0.125);
```

本家ではステルスロック（いわタイプ）のダメージは相手のタイプ相性で変動する（ほのお/ひこうには最大HP の 50%）。現在は固定 12.5%。

---

## 6. テストカバレッジの不足

### 6.1 `battle.js` のテストが完全に欠如

最も複雑なモジュール（337行）にテストがない。以下を優先的にテストすべき:

| テスト対象 | 重要度 |
|---|---|
| `executeTurn` — ターン実行と行動順 | 高 |
| `switchPokemon` — 交代 + エントリハザード | 高 |
| `applyEndOfTurnEffects` — 状態異常ダメージ | 高 |
| `checkWinCondition` — 勝敗判定 | 高 |
| `applyMoveEffects` — 技の追加効果 | 中 |
| `determineOrder` — 優先度 / 素早さ判定 | 中 |

### 6.2 エッジケースのテスト不足

- 倒れたポケモンへの攻撃
- タイプ無効（ゴースト→ノーマル等）でのダメージ計算
- `validateTeam` のテストが存在しない
- 急所率が高い技 (`leafBlade` の `critRatio: 2`) のテスト

---

## 7. 改善提案（優先度順）

| # | 内容 | 重要度 | 工数 |
|---|------|--------|------|
| 1 | `getEffectiveStat` の accuracy/evasion バグ修正 | 高 | 小 |
| 2 | `canMove()` + バトルログの不整合修正 | 高 | 小 |
| 3 | `toxicCounter` を Pokemon クラスに統合 | 中 | 小 |
| 4 | `battle.test.js` の作成 | 高 | 中 |
| 5 | RNG の注入可能化（テスタビリティ向上） | 中 | 中 |
| 6 | `switch` 内の `const` スコープ修正 | 低 | 小 |
| 7 | Protect 連続使用制限の実装 | 低 | 小 |
| 8 | ステルスロックのタイプ相性反映 | 低 | 小 |
| 9 | 天候効果の実装 | 低 | 中 |

---

## 8. 総評

**全体評価: B+（良好・修正推奨事項あり）**

ポケモンバトルシミュレータとして基本的なアーキテクチャは適切に設計されており、モジュール分離・ステータス計算・タイプ相性の実装品質は高い。

ただし、**ひるみログが出力されないバグ**、**accuracy/evasion の NaN 問題**、**toxicCounter のスコープ漏れ**は実際のバトル進行に影響するため、優先的に修正すべき。また、最も複雑な `battle.js` にテストが存在しないことは大きなリスクであり、RNG の注入可能化と合わせて対応することを推奨する。
