# ポケモンカスタムバトルシミュレーター

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white" alt="Node.js icon badge" />
  <img src="https://img.shields.io/badge/Test-Jest-C21325?logo=jest&logoColor=white" alt="Jest icon badge" />
  <img src="https://img.shields.io/badge/Library-Pok%C3%A9mon%20Battle%20Simulator-EF5350?logo=githubsponsors&logoColor=white" alt="Pokemon battle simulator badge" />
</p>

カスタムポケモンのダメージ計算・バトルシミュレーションライブラリです。README 冒頭に、オープンソースのアイコンセットを利用したバッジアイコンを追加しました。

## セットアップ

```bash
npm install
```

## テスト

```bash
npm test
```

全55テストが通過します。

## テストカバレッジ

```bash
npm run test:coverage
```

## 技術スタック

- JavaScript (Node.js)
- Jest（テストフレームワーク）

## 構成

- `src/` - メインソースコード（ダメージ計算、タイプ相性、技データ）
- `tests/` - テストスイート（5ファイル、55テスト）

## アイコンについて

- README のバッジは [Shields.io](https://shields.io/) の表示機能と、同サービスが利用しているオープンソースの `Simple Icons` ロゴを使っています。
- ローカルのビルドやライブラリ本体の動作には影響せず、ドキュメント表示のみの変更です。
