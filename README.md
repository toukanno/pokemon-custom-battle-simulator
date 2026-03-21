# ポケモンカスタムバトルシミュレーター

カスタムポケモンのダメージ計算・バトルシミュレーションライブラリ

## セットアップ

```bash
npm install
```

## テスト

```bash
npm test
```

全62テストが通過します。

## テストカバレッジ

```bash
npm run test:coverage
```

## アイコン対応

- `buildPokemon()` / `buildTeam()` は `icon` メタデータを受け取れます。
- アイコンは文字列パス、または `{ source, path, alt }` 形式で指定できます。
- `source` は `custom` に加えて `pkhex` も利用できます。
- Pokedexの初期データには PKHeX 由来のアイコン識別子を含めています。

## 技術スタック

- JavaScript (Node.js)
- Jest（テストフレームワーク）

## 構成

- `src/` - メインソースコード（ダメージ計算、タイプ相性、技データ）
- `tests/` - テストスイート（5ファイル、55テスト）
