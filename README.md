# Gilgame studio

インディーゲーム開発者向けの公式サイトと管理CMS。Next.js App Router / React / TypeScript strict / Tailwind CSS / shadcn形式のRadix UIコンポーネント / Motion / React Three Fiber / Supabase / Tiptapで構築しています。

ギルガメの水色・金色と、ロゴのクリスタルを基調にしたデザインです。ブランド素材と設定変更は[ブランドガイド](docs/gilgame-brand.md)、実行済みのチェックは[検証結果](docs/verification.md)を参照してください。

## すぐにDockerで確認する

必要: Docker Desktop（Linuxコンテナ）とDocker Compose v2以降。ホスト側のNode.jsは不要です。

```powershell
docker compose up -d --build
```

**開発サイト: http://localhost:3000**

初回は依存パッケージのインストールに数分かかります。ソースはbind mount、`node_modules`とNext.jsキャッシュはDocker volumeです。編集はホットリロードされます。

```powershell
docker compose logs -f web
docker compose stop web
docker compose start web
```

Supabase未設定でも、公開ページはサンプル作品・記事で表示されます。フッターにDEMO MODEを表示し、管理画面はログイン画面へ転送、ログインとお問い合わせの送信は無効化されます。デモの変更を保存できるように見せる仮実装はありません。

依存パッケージを変更した場合は、volume側も更新してください。

```powershell
docker compose exec web npm ci
docker compose restart web
```

## ディレクトリ

```text
src/app/(public)/       ホーム、ゲーム、ブログ、About、Contact
src/app/login/          Supabase Authログイン / Server Actions
src/app/admin/          認証・DB権限で保護されたCMS
src/app/api/admin/      サーバー側検証付き保存・削除・画像API
src/components/        3D、Tiptap、フォーム、公開UI
src/components/ui/     Radix / shadcn形式のUIプリミティブ
src/lib/               Supabase、公開データ、Zod、型、UI辞書
src/proxy.ts           管理経路のセッション更新
supabase/migrations/   スキーマ・RLS・Storage・送信回数制限
supabase/seed.sql      開発専用サンプル（本番では実行しない）
tests/unit/            入力、公開条件、API認可とCRUD
tests/db/              PostgreSQL実機でのRLS / CRUD
tests/e2e/             Playwright PC / モバイル
```

日本語が既定です。共通UI文言の辞書は`src/lib/i18n.ts`に分離しています。英語対応時は`en`辞書と`/[locale]`ルートを追加し、CMSコンテンツにも翻訳カラムまたは翻訳テーブルを追加してください。現時点で英語表示機能はありません。

## Supabaseを接続する

1. Supabaseでプロジェクトを作成。
2. Project Settings / APIからProject URLと**Publishable key**（`sb_publishable_...`）を取得。旧プロジェクトのanon keyも利用できます。Service Role / Secret keyは使いません。
3. `.env.example`を`.env.local`にコピーして値を設定。

```powershell
Copy-Item .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

4. Supabase SQL Editorで以下を順番に実行。
   - `supabase/migrations/202609240001_initial.sql`
   - `supabase/migrations/202609240002_contact_limit.sql`
   - `supabase/migrations/202609280001_gilgame_brand.sql`
5. 開発用プロジェクトのみ、任意で`supabase/seed.sql`を実行。
6. Authentication / Providers / Emailで新規ユーザーのサインアップを無効にします。公開の登録フォームは実装していませんが、**Supabase側の設定も必須**です。
7. Authentication / URL ConfigurationのSite URLを本番URLまたはローカルURLに設定。
8. Dockerを再作成して環境変数を反映。

```powershell
docker compose up -d --force-recreate web
```

接続設定がある場合、データ取得エラーをデモデータで隠しません。マイグレーション未実行や権限エラーではエラー画面になります。

Supabase CLIを使う場合も同じSQLを使えます。

```sh
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

本番DBに`tests/db/bootstrap.sql`は絶対に実行しないでください。これは隔離テスト用のAuth・Storage互換fixtureです。

## 管理者を作成する

Supabase Dashboard → Authentication → Users → Add userでメール・パスワードのユーザーを作成し、メール確認済みにします。取得したUUIDをSQL Editorで許可します。

```sql
insert into public.admin_users (id)
values ('AUTH_USERS_UUID');
```

http://localhost:3000/login からログインできます。一般ユーザーはログインできてもCMSに入れません。`admin_users`はブラウザから追加・変更・削除できません。権限取消はSQL Editorで該当行を削除します。

## CMS操作

- `/admin`: 件数と作成導線。
- `/admin/posts`: 記事一覧、作成、編集、削除。Tiptapの見出し、太字、リンク、画像、コード、引用、リスト、プレビュー。
- `/admin/games`: 作品の紹介、ジャンル、タグ、開発状況、公開状態、表示順、リリース日、技術、ギャラリー、YouTube、外部リンク。
- `/admin/media`: JPEG / PNG / WebP（**4MBまで**）。内容をSharpでデコード・検証し、位置情報などのメタデータを除去してWebPで保存します。アップロード中は進捗を表示。使用中の画像は削除できません。
- `/admin/settings`: サイト名、説明、プロフィール、OG画像、SNSリンク。

画像はメディア画面でアップロード → URLをコピー → 各フォームへ貼り付けます。外部リンクは1行に`Steam | https://...`、タグはカンマ区切り、ギャラリーは1行1URLです。画像URLは同梱`/art/`素材、`/gilgame.png`、`/logo.png`、Supabaseの公開media URLに限定しています。

公開画像バケットは**公開配信用**です。画像URLを知っている人は取得できます。下書き本文・管理画面・画像一覧は非公開ですが、公開前の機密画像や個人情報をこのバケットに保存しないでください。

予約投稿は`status = scheduled`かつ`published_at <= now()`になったときにDBとサーバーの両方で公開対象になります。ジョブによる状態変更は不要です。画面の日付入力はブラウザのタイムゾーン、DB保存はUTCです。公開状態でも未来日時なら非公開です。キャッシュは60秒で再検証し、CMS保存時は即時無効化します。

## お問い合わせメール（任意）

Resendで送信ドメインを検証し、以下の**サーバー専用**変数を設定します。

```dotenv
RESEND_API_KEY=YOUR_RESEND_KEY
CONTACT_FROM=Studio <contact@your-domain.example>
CONTACT_TO=your-inbox@example.com
CONTACT_RATE_LIMIT_SECRET=LONG_RANDOM_SECRET
```

Supabase接続と2番目のマイグレーションも必要です。未設定時はフォームを送信不可にします。本文はプレーンテキストで配信。ハニーポット、Origin検証、入力制限、IPを秘密文字列付きでハッシュ化したDBの送信回数制限（1時間3回）を実装しています。Vercel以外に公開する場合、信頼するリバースプロキシで`X-Forwarded-For`を上書きしてください。

## Dockerでproduction build

開発用とは別に、非root・Next.js standalone構成のイメージを生成します。秘密情報はイメージにコピーしません。

設定なしのデモをビルド・起動:

```powershell
docker compose -f compose.production.yaml up -d --build
```

**production確認: http://localhost:3001**

本番確認コンテナの公開URLは`http://localhost:3001`です。開発用の3000番ポートとOrigin検証を分けています。このCompose構成を別ドメインで運用する場合は`PRODUCTION_SITE_URL=https://your-domain.example`を指定して再ビルドしてください。

Supabase接続済みのビルド:

```powershell
docker compose --env-file .env.local -f compose.production.yaml up -d --build
```

`NEXT_PUBLIC_*`はビルド時にも必要です。キーやURLを変更したら必ず再ビルドしてください。画像は`next/image`で最適化し、リッチテキストはHTMLを直接挿入せず許可したノードだけ描画します。

ビルドのみ行う場合:

```powershell
docker compose --env-file .env.local -f compose.production.yaml build
```

`.env.local`がないデモ環境では`--env-file .env.local`を省略できます。

## 検証コマンド

```powershell
docker compose exec web npm run lint
docker compose exec web npm run typecheck
docker compose exec web npm test
docker compose exec web npm run build
```

PostgreSQLでの認可・CRUD検証（クラウドの認証情報は不要）:

```powershell
docker compose -f compose.test.yaml up -d --wait
docker compose -f compose.test.yaml exec -T db-test psql -U postgres -d studio_test -v ON_ERROR_STOP=1 -f /tests/policies.sql
docker compose -f compose.test.yaml stop db-test
```

このDBはtmpfsで起動し、テスト操作はtransaction内でrollbackします。Supabaseの実Auth API・Storage配信サービスそのものの統合テストではなく、同じマイグレーションを実行したPostgreSQLのRLS・権限・トリガー・CRUD検証です。

Playwright（ホストにNodeがある場合）:

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

DockerのみでE2E（PowerShell、開発サーバー起動状態）:

```powershell
docker run --rm --ipc=host -v "${PWD}:/app" -v yos_e2e_modules:/app/node_modules -w /app -e E2E_BASE_URL=http://host.docker.internal:3000 mcr.microsoft.com/playwright:v1.63.0-noble sh -c 'npm ci && npm run test:e2e'
```

E2EはPCとモバイルでブランド表示、公開導線、検索、未認証の管理画面保護、404、SEO、モーション抑制を検証します。Supabase接続済み・未設定の両方に対応します。実CMSでは、管理者ログイン → 記事作成 → 下書き非公開 → 公開 → 編集 → 画像添付 → 削除をステージングで確認してください。失敗時のスクリーンショットとtraceは`test-results/`、HTMLレポートは`playwright-report/`です。

## Node.jsで開発

Node 24 LTSを使用しています。Dockerイメージは初回確認時のNode公式LTSイメージ。npm lockfileをコミットし、`npm ci`で依存を再現します。

```sh
npm ci
npm run dev
npm run build
npm start
```

## Vercelへのデプロイ

1. このリポジトリをGitHub等へpushしてVercelにImport（Framework: Next.js）。
2. Node.js 24.x、Install: `npm ci`、Build: `npm run build`を設定。
3. `.env.example`の必要な値をVercelのEnvironment Variablesに追加。`NEXT_PUBLIC_SITE_URL`は本番のhttps URL。
4. Supabaseのマイグレーション・管理者作成・新規登録無効化を済ませてからDeploy。
5. SupabaseのSite URLを本番URLに更新。
6. 管理者ログイン、保存、画像アップロード、匿名の下書きURLが404になることを確認。

Vercel Functionsの4.5MB body制限に合わせ、画像は4MBまでにしています。Dockerfileはローカル・コンテナホスティング用で、VercelはNext.jsとして直接ビルドします。本番のSupabase設定・メール配信・Vercelデプロイはアカウント情報が必要なため、未設定状態では実接続済みとは扱っていません。

## セキュリティ・運用

- `admin_users`のDB情報を`is_admin()`で照合。メタデータやフォームの自己申告で管理者判定しません。
- 管理layoutだけでなく各ページ・API・Server Actionでも認証・認可を確認。テーブルとStorageにもRLS。
- 公開データ取得は管理者cookieを使わない匿名クライアント。下書きをキャッシュに混入しません。
- 通常のWebアプリにService Role Keyは不要です。ブランド設定の保守スクリプトだけは任意のサーバー専用`SUPABASE_SERVICE_ROLE_KEY`を使用します。秘密情報を`NEXT_PUBLIC_*`に入れないでください。
- `.env*`はgitignore / dockerignore対象。`.env.example`のみコミット可能。
- 管理画面はnoindex、robotsは管理・API経路を除外。公開ページはmetadata、OG、sitemap、構造化データを生成。
- Supabaseのバックアップ方針、Authのレート制限、Vercelの監視を本番プロジェクトで設定してください。
- CMSは単独管理者向けの最終保存優先です。同時編集のロックや編集履歴はありません。

## パッケージ選定と参考資料

実装開始時に公式ドキュメントとnpm `latest` / `peerDependencies`を確認しました。Next.js 16.3.6 / React 19.3.0。ESLintは最新10.11.0を採用。`eslint-config-next`が内包する旧プラグインのpeer制約を避け、公式`@next/eslint-plugin-next`、`typescript-eslint`、`eslint-plugin-react-hooks`を直接組み合わせています。TypeScriptはtypescript-eslintの`<6.1.0`制約に従い6.0.3を採用しています。詳細な解決バージョンは`package-lock.json`を参照。

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Proxy](https://nextjs.org/docs/app/getting-started/proxy)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Tiptap installation](https://tiptap.dev/docs/editor/getting-started/install)
- [Playwright Docker](https://playwright.dev/docs/docker)
- [Vercel Functionsの制限](https://vercel.com/docs/functions/limitations)
- サンプル画像と生成プロンプト: [docs/assets.md](docs/assets.md)
