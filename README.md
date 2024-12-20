# ルーレットアプリケーション

## 更新履歴

### 2023/12/21
- 初期実装
- 基本的なルーレット機能
- 参加者管理システム
- 当選者表示機能
- レスポンシブデザイン

### 2023/12/22
- 名前の編集機能を追加
  - ホバー時に表示される編集・削除ボタン
  - インライン編集モード
  - 編集時の文字数制限（20文字）
  - キャンセル・完了ボタンによる編集制御
- 一括削除機能の追加
  - 確認モーダルの実装
  - 全参加者の一括削除
- UIの改善
  - 編集モードのレイアウト最適化
  - ボタンの視認性向上
  - スムーズなトランジション効果

## 概要
このプロジェクトは、React.jsを使用して開発されたインタラクティブなルーレットアプリケーションです。参加者の名前を追加し、ルーレットを回して、ランダムに選択を行うことができます。各参加者には固有の色が割り当てられ、ルーレットの扇形として表示されます。

## 技術スタック
- React.js 18.2.0
- Chakra UI 2.8.2
- Webpack 5.91.0
- その他の主要な依存関係:
  - @emotion/react & @emotion/styled
  - react-icons
  - framer-motion

## 主な機能

### 1. 参加者管理
- **一括入力機能**
  - テキストエリアで複数名を一度に追加（1行1名）
  - 20文字までの名前制限
  - 空行の自動除外

- **参加者リスト**
  - 各参加者に固有の色を自動割り当て
  - 参加者数の表示
  - シャッフル機能
  - ホバー時に表示される削除ボタン

### 2. ルーレット機能
- **回転制御**
  - スタート: 加速から一定速度への移行
  - ストップ: 自然な減速
  - リセット: 初期位置に戻す
  - 2名以上の参加者が必要

- **視覚的フィードバック**
  - 参加者ごとの固有色による扇形表示
  - 固定されたボックスシャドウ効果
  - 当選者の強調表示

### 3. 当選者表示
- 回転停止時に自動判定
- 当選者の色を使用したアラート表示
- 名前リストでの強調表示

## インストールと実行方法

### 必要条件
- Node.js
- npm

### セットアップ
```bash
# 依存関係のインストール
npm install

# 開発モードで実行
npm start

# プロダクションビルド
npm run build
```

## アプリケーション構造

### コンポーネント構造
- App.js: メインのアプリケーションコンポーネント
  - ルーレットの表示と制御
  - 参加者リストの管理
  - 当選者の判定と表示

### 主要な機能の説明

#### ルーレットの回転制御
- 加速フェーズ: 回転速度が徐々に上昇
- 一定速度フェーズ: ランダムな時間（4-7秒）維持
- 減速フェーズ: 減速係数0.9で徐々に停止

#### 参加者管理システム
- 一括入力: 複数名を一度に追加可能
- バリデーション: 空白文字と文字数制限
- シャッフル: Fisher-Yatesアルゴリズムによる順序のランダム化
- 削除機能: 個別の参加者を削除可能

## スタイリング

### レイアウト構造
1. **ルーレット部分**
   - サイズ: 500px × 500px
   - 二重構造による固定シャドウ効果
   - 参加者ごとの色による扇形表示

2. **参加者リスト**
   - コンパクトな表示（最大幅280px）
   - ホバーで表示される削除ボタン
   - 当選者の強調表示効果

3. **入力フォーム**
   - マルチライン入力対応
   - プレースホルダーによる使用例表示
   - 入力制限のビジュアルフィードバック

### インタラクティブ要素
- ホバーエフェクト
- スムーズなアニメーション
- 視覚的フィードバック

### レスポンシブデザイン
- フレックスボックスによる柔軟なレイアウト
- 中央寄せコンテンツ
- 適切なマージンとパディング

## 開発者向け情報

### 主要なファイル
- `src/App.js`: メインのアプリケーションロジック
- `src/App.css`: スタイリング定義
- `webpack.config.js`: ビルド設定

### コードの保守
- ESLintの設定に従ってコードを記述
- Create React Appの規約に準拠

### パフォーマンス最適化
- アニメーションの最適化（requestAnimationFrame使用）
- 効率的なステート管理
- 適切なコンポーネント分割
