# Pokemon Custom Battle Simulator

ブラウザ UI・対戦エンジン・分析 API を同梱した、ローカル実行向けのポケモン風カスタムバトルシミュレーターです。

## 主な機能

- 1vs1 のターン制バトルシミュレーション
- 状態異常 / ステルスロック / どくびし / Protect / 急所 / タイプ相性対応
- シンプルな GBA 風 Web UI
- チーム妥当性チェック API
- 対戦前の脅威分析 / 最適技候補 / 交代候補を返す分析 API
- Jest によるユニットテスト

## ディレクトリ構成

```text
.
├─ index.html                # フロントエンド UI
├─ server.js                 # HTTP サーバー / API / 静的ファイル配信
├─ src/
│  ├─ battle.js              # 対戦進行ロジック
│  ├─ pokemon.js             # ポケモン実体・能力計算・状態異常
│  ├─ damage.js              # ダメージ計算
│  ├─ moves.js               # 技定義
│  ├─ teambuilder.js         # 図鑑・チーム生成・検証
│  ├─ infoGatherer.js        # 盤面分析 / 推奨技 / 交代候補
│  └─ ...
├─ tests/                    # Jest テスト
└─ illustrations/            # SVG アセット
```

## セットアップ

```bash
npm install
npm start
```

起動後、`http://localhost:3000` を開いてください。

## API

### `GET /api/health`
ヘルスチェック。

### `GET /api/pokedex`
利用可能なポケモン一覧と種族値合計（BST）を返します。

### `GET /api/moves`
技データ一覧を返します。

### `POST /api/teams/validate`
チーム構成の妥当性を検証します。

リクエスト例:

```json
{
  "team": [
    { "species": "charizard", "moves": ["flamethrower", "dragonClaw", "earthquake", "protect"] }
  ]
}
```

### `POST /api/battle/preview`
対戦開始前の分析情報（危険度、最適技、交代候補）を返します。

### `POST /api/battle/simulate-turn`
指定した 2 チームと行動から 1 ターン分をシミュレーションします。

## 開発コマンド

```bash
npm test
npm start
```

## 今後の改善候補

- Battle セッションをサーバー側に保持し、複数ターン対戦 API を提供する
- UI を React + TypeScript に移行して表示ロジックとゲームロジックを明確に分離する
- ポケモン・技・特性・アイテムのデータを外部 JSON 化する
- AI 難易度設定とリプレイ保存機能を追加する
