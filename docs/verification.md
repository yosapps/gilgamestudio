# 検証結果

最新実行日: 2026-09-29（JST）、Gilgame studioへのデザイン変更後。

| 検証 | 結果 |
| --- | --- |
| ESLint 10 / Next.js・TypeScript・React Hooks規則 | エラー・警告なし |
| TypeScript strict (`tsc --noEmit`) | 成功 |
| Vitest | 28件成功（入力検証、ブランド画像URL、公開条件、認可、CRUD、Origin、body上限） |
| PostgreSQL 17.11（9/25実行） | 匿名・一般ユーザー・管理者のRLS、CRUD、予約公開、トリガー、Storageポリシー、送信制限を検証し成功。今回ポリシー変更なし |
| 開発用シード（9/25実行） | 成功（ゲーム2件、記事5件。下書き・未来記事を含む）。クラウドには投入していません |
| Next.js production build | 成功 |
| Docker production image | standalone・非rootで起動、healthcheck成功 |
| Playwright・開発サーバー | PC / モバイル計8件成功 |
| Playwright・本番コンテナ | PC / モバイル計8件成功 |
| 表示確認 | PC 1440px / モバイル390px、スクリーンショット確認。クライアントエラー0件 |
| ローカルHTTP | 開発3000・本番3001とも200 |
| Supabaseクラウド | 匿名の公開データ取得とsite_settingsのブランド更新成功。変更前のバックアップあり |
| 公開バンドル | Service Role Keyを含まないことを確認。公開プレフィックス付きのService Role変数も除去済み |

今回のブラウザ検証ではブランド見出し・キャラクター画像、3D Canvasの起動、作品一覧への導線・絞り込み操作、ブログ検索の空結果、管理画面からログインへの転送、接続済みログインフォーム、モーション抑制、横はみ出し、不存在URLの404、ブランドOG画像、新しいSVGアイコンを確認しました。公開作品・記事が0件のため、詳細ページのコンテンツ表示は今回のクラウドE2Eには含みません。9/25にはデモ環境で作品詳細、記事内コード表示、作品別OGタイトルを検証済みです。

ホーム・About・Games・Journal・Contact・LoginのPCとモバイルのスクリーンショットを取得しました。`test-results/visual/`と`test-results/pages/`に保存しています。初回の開発E2Eは編集中のページ遷移で1件中断しましたが、編集完了後の再実行では8件すべて成功しています。

## 未検証・未設定のもの

- 管理者ログインから保存・画像配信までのSupabaseクラウドE2E。公開データ取得と設定変更は実接続済みですが、管理者パスワードによる認証・Storageアップロードは今回実行していません。APIはモックテスト、DBの認可は実PostgreSQLの互換fixtureで検証しています。
- Resendの実メール配信。未設定時は送信不可です。
- Vercelへのデプロイ。設定手順をREADMEに記載しています。

現在はSupabaseの実データを表示しています。公開作品・記事は0件で、準備中の表示です。サイト名・コンセプト・プロフィール・OG画像はGilgame studioへ更新しています。ブランド変更の詳細は[ブランドガイド](gilgame-brand.md)を参照してください。

## 起動中の確認先

- 開発: http://localhost:3000
- production: http://localhost:3001

DBテスト用コンテナは停止済みです。起動・停止・再ビルドの手順は[README](../README.md)を参照してください。
