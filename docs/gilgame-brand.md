# Gilgame studio ブランドガイド

## コンセプト

「小さな一歩から、きらめく冒険へ。」

水色のカメ「ギルガメ」の親しみやすさを中心に、発見する楽しさ、できたときのうれしさ、また会いたくなる世界を表現します。個人開発スタジオとして、作品を少しずつ育てる姿勢を紹介しています。

公開ページは白とアイスブルーをベースに、ロゴのサファイアブルー、キャラクターの甲羅のゴールドをアクセントに使用。管理画面は紺色を保ち、シアンの操作ボタンに統一しています。日本語は丸みのあるM PLUS Rounded 1c、英数字はSpace Groteskをセルフホストで配信。動きは小さなクリスタルとスクロール演出に限定し、モーション抑制設定を尊重します。

## 素材と実装

- `public/gilgame.png`: ユーザー提供のメインキャラクター。ホームとAboutで使用。原本は変更していません。
- `public/logo.png`: ユーザー提供のロゴ。ヘッダー・フッター・作品準備中・OG画像に使用。原本は変更していません。
- `src/app/icon.svg`: ロゴの結晶を小さいサイズで識別できるよう再構成したSVG。青い結晶と金色のきらめき。
- `src/components/scene.tsx`: ロゴに呼応する装飾用3Dクリスタル。WebGLを使えない場合もキャラクター画像は表示します。
- `src/lib/brand.ts`: 初期ブランド文言。Supabase接続時のサイト設定はCMSから変更できます。
- `src/app/globals.css`: 公開ページと管理画面の配色・レスポンシブ設定。

作品や記事を未公開の場合は準備中の表示になります。今回、Supabaseへ架空のゲームやブログを追加していません。未接続環境のサンプル画像は引き続きデモ専用です。

## Supabase設定の変更

2026-09-29、接続済みSupabaseの`site_settings`について、サイト名・説明・プロフィール・OG画像を更新しました。SNSリンク、作品、記事、管理者権限は変更していません。

変更前のバックアップはローカルの`tmp/brand-backups/settings-1790607754632.json`に保存しています。`tmp/`はGitとDockerのビルド対象から除外しています。

新規環境は`supabase/migrations/202609280001_gilgame_brand.sql`まで順番に適用します。既存環境で保守スクリプトを使う場合は、サーバー専用の`SUPABASE_SERVICE_ROLE_KEY`を設定し、以下を実行します。

```powershell
# 変更内容の確認のみ
docker compose exec web node scripts/update-gilgame-brand.mjs
# バックアップを保存して適用
docker compose exec web node scripts/update-gilgame-brand.mjs --apply
```

通常のCMS操作にService Role Keyは不要です。保守用キーに`NEXT_PUBLIC_`を付けないでください。`.env.example`は値を含まないテンプレートです。今回、既存ローカル設定のService Role変数名をサーバー専用名へ修正しました。

SQL・保守スクリプトから更新した後は公開キャッシュの再検証まで最大60秒待ってください。通常のCMS保存はキャッシュを無効化します。
