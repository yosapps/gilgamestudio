import type { Locale } from './locale';
import { studioBrand } from './brand';

// Japanese source copy is the key. CMS content without a translation stays original.
export const english: Record<string, string> = {
  プロトタイプ: 'Prototype',
  リリース済み: 'Released',
  開発休止: 'On hold',
  記事内画像: 'Article image',
  'スタジオから、こんにちは。': 'Hello from the studio.',
  [studioBrand.description]:
    'Small steps, sparkling adventures. An independent game studio creating worlds that bring a smile, together with Gilgame.',
  [studioBrand.profile]:
    'Gilgame studio is an independent game studio turning little “what ifs” into games. Alongside Gilgame, our sky-blue companion with a golden shell and a sparkling crystal, we create worlds full of discovery, small victories, and reasons to return.',
  '小さな一歩から、': 'From small steps,',
  'きらめく冒険へ。': 'to sparkling adventures.',
  '小さな一歩から、きらめく冒険へ。': 'Small steps. Sparkling adventures.',
  '見つける楽しさ。できたときのうれしさ。':
    'The joy of discovery. The thrill of figuring it out.',
  'ギルガメと一緒に、心はずむ世界をつくっています。':
    'We create worlds of wonder, together with Gilgame.',
  ゲームを探索する: 'Explore our games',
  開発の舞台裏へ: 'Behind the scenes',
  'ワクワクを、遊べる形に。': 'A little wonder, ready to play.',
  すべてのゲーム: 'All games',
  '← すべてのゲーム': '← All games',
  '水色のからだ、金色の甲羅、青いクリスタルが目印のギルガメ':
    'Gilgame, a sky-blue turtle with a golden shell and a blue crystal',
  'こんにちは、': 'Hello there,',
  'ギルガメです。': 'I’m Gilgame.',
  'きらりと光るクリスタルと、': 'A sparkling crystal, a friendly smile,',
  '笑顔が目印の、小さな相棒。': 'and a little companion for the journey.',
  '新しい世界への一歩は、いつだってドキドキ。':
    'The first step into a new world is always exciting.',
  'その先にある発見を、一緒に楽しもう。':
    'Let’s discover what lies ahead, together.',
  きらめく好奇心: 'Sparkling curiosity',
  笑顔になる冒険: 'Adventures that make you smile',
  ギルガメとスタジオを知る: 'Meet Gilgame and the studio',
  '冒険の、その舞台裏。': 'Behind every little adventure.',
  すべての記事: 'All stories',
  '小さくつくって、': 'Make something small.',
  '大きくときめく。': 'Find something wonderful.',
  開発者について: 'About the creator',
  'まずは、つくって試してみる': 'Start by making and experimenting',
  '小さな発見を、大切にする': 'Treasure the little discoveries',
  また会いたくなる世界をつくる: 'Create worlds worth returning to',
  主なナビゲーション: 'Main navigation',
  メインナビゲーション: 'Main navigation',
  ホーム: 'Home',
  管理者ログイン: 'Admin login',
  公式X: 'Official X',
  新しいタブで開きます: 'opens in a new tab',
  'DEMO MODE — 掲載作品・記事はサンプルです。Supabase未接続。':
    'DEMO MODE — Games and posts are samples. Supabase is not connected.',
  '「楽しそう！」を、': 'That sounds fun.',
  '一緒につくろう。': 'Let’s make it together.',
  XのDMでお問い合わせ: 'Get in touch via X DM',
  '小さな冒険のつづきは、Xで。': 'Follow the next little adventure on X.',
  'ゲームづくりの近況やお知らせを、公式アカウントからお届けします。':
    'Follow our official account for game development updates and studio news.',
  公式Xをチェック: 'Follow us on X',
  'Gilgame studioのクリスタルロゴ': 'Gilgame studio crystal logo',
  '次の冒険を、準備中。': 'Our next adventure is taking shape.',
  '開発ノートは、これから。': 'Our first story is still ahead.',
  'まだ小さなアイデアを、少しずつ遊べる形に。作品をお披露目できる日まで、ギルガメと一緒にお待ちください。':
    'Little ideas are slowly becoming something you can play. Stay with Gilgame while we get ready to share our creations.',
  'ひらめいたこと、試したこと、ちょっとした発見。ゲームづくりの道のりを、この場所に綴っていきます。':
    'Ideas, experiments, and small discoveries. This is where we’ll share our game-making journey.',
  ギルガメとスタジオについて: 'Meet Gilgame and the studio',
  ゲームの制作状況を見る: 'See what we’re making',
  '手を振って迎える、水色のカメのキャラクター「ギルガメ」':
    'Gilgame, a friendly sky-blue turtle, waving hello',
  'こんにちは、ギルガメです。': 'Hi, I’m Gilgame!',
  '小さな相棒と、': 'A little companion.',
  '大きなワクワクを。': 'A world of wonder.',
  'Gilgame studioのメインキャラクター、ギルガメ':
    'Gilgame, the mascot of Gilgame studio',
  'です。': '.',
  'ギルガメと、はじめの一歩。': 'The first step, with Gilgame.',
  '水色のからだに金色の甲羅、額には青いクリスタル。ギルガメは、このスタジオのメインキャラクターです。親しみやすい笑顔と、きらめく好奇心を、ゲームづくりの原点にしています。':
    'A sky-blue body, a golden shell, and a blue crystal on the forehead. Gilgame is our studio mascot. That friendly smile and sparkling curiosity inspire every game we make.',
  '大切にしたい、遊びの手触り。': 'Small moments that make play special.',
  '新しい道を見つけた瞬間。少し工夫して、うまくできた瞬間。そんな小さな喜びが積み重なる、やさしくて夢中になれる体験を目指しています。':
    'Finding a new path. Trying a little differently and making it work. We aim to create welcoming, absorbing experiences built from these small moments of joy.',
  '一歩ずつ、かたちに。': 'Bringing ideas to life, step by step.',
  'Unreal Engine / Godot / Blender / Visual Studio Code。アイデアを試し、遊んで、少しずつ磨く。その制作過程も、開発ノートで届けていきます。':
    'Unreal Engine / Godot / Blender / Visual Studio Code. We experiment, play, and polish a little at a time, sharing the process in our development journal.',
  'Gilgame studioがつくる、小さな発見ときらめく冒険。':
    'Little discoveries and sparkling adventures, made by Gilgame studio.',
  'ひとつのアイデアから、夢中になれる冒険へ。':
    'From a single idea to an adventure to get lost in.',
  ジャンル: 'Genre',
  開発状況: 'Development status',
  すべて: 'All',
  絞り込む: 'Filter',
  '条件に一致するゲームはありません。': 'No games match these filters.',
  'ゲーム開発の舞台裏、技術ノート、制作の記録。':
    'Behind the scenes of game development, technical notes, and creative discoveries.',
  'ひらめきも、寄り道も。ゲームづくりの小さな足あと。':
    'Ideas, detours, and little steps along the game-making journey.',
  キーワード: 'Keyword',
  '記事を検索…': 'Search stories…',
  カテゴリ: 'Category',
  タグ: 'Tag',
  検索: 'Search',
  '記事が見つかりませんでした。検索条件を変更してください。':
    'No stories found. Try a different search.',
  ページネーション: 'Pagination',
  'ゲームやコラボレーション、取材に関するお問い合わせは、公式X（@gilgamestudio）のダイレクトメッセージへ。':
    'For games, collaborations, or press inquiries, send a direct message to our official X account, @gilgamestudio.',
  '何か、': 'Let’s make',
  '面白いことを一緒に。': 'something wonderful together.',
  'お問い合わせは、XのDMへ。': 'Say hello with a DM on X.',
  'ゲームについてのご質問、制作のご相談、':
    'Questions about our games, a project in mind,',
  'コラボレーションや取材のご依頼はこちらへ。':
    'a collaboration, or a press inquiry? Get in touch.',
  '公式アカウントのプロフィールを開き、メッセージボタンからDMをお送りください。':
    'Open our official profile and use the message button to send us a DM.',
  'ご相談内容や関連するURLなどを添えていただけるとスムーズです。':
    'A short description and any relevant links will help us understand your inquiry.',
  'ゲームのことも、新しいアイデアも。': 'Games, ideas, and new possibilities.',
  'まずはDMで、お気軽にご相談ください。':
    'Feel free to start the conversation with a DM.',
  公式Xを開く: 'Open our X profile',
  '公式Xを開く（新しいタブで開きます）':
    'Open our X profile (opens in a new tab)',
  'DMの送信にはXへのログインが必要です。':
    'Sign in to X to send a direct message.',
  本文へ移動: 'Skip to content',
  'ここは、まだ未知の世界。': 'Uncharted territory.',
  'ページが見つからないか、公開されていません。':
    'This page could not be found or is not published yet.',
  ホームへ戻る: 'Back to home',
  読み込みに失敗しました: 'Unable to load this page',
  '時間をおいてもう一度お試しください。': 'Please wait a moment and try again.',
  再読み込み: 'Try again',
  この世界について: 'About this world',
  リリース日: 'Release date',
  未定: 'To be announced',
  使用技術: 'Built with',
  あわせて読む: 'More to explore',
  コンセプトアート: 'concept art',
  キービジュアル: 'key art',
  トレーラー: 'trailer',
  スクリーンショット: 'screenshot',
  開発中: 'In development',
  公開済み: 'Released',
  企画中: 'In planning',
  'おかえりなさい。': 'Welcome back.',
  '許可された管理者アカウントでログインしてください。':
    'Sign in with an authorized administrator account.',
  'Supabase未設定です。.env.localを設定し、SQLマイグレーションと管理者登録を行ってください。':
    'Supabase is not configured. Set up .env.local, run the SQL migrations, and register an administrator.',
  '管理者権限がありません。': 'Administrator access is required.',
  メールアドレス: 'Email address',
  パスワード: 'Password',
  'ログイン中…': 'Signing in…',
  ログイン: 'Sign in',
  'メールアドレスとパスワードを確認してください。':
    'Please check your email address and password.',
  'Supabaseの接続設定が必要です。READMEをご確認ください。':
    'Supabase connection settings are required. Please see the README.',
  'ログインできませんでした。入力情報をご確認ください。':
    'Unable to sign in. Please check your credentials.',
  'このアカウントには管理者権限がありません。':
    'This account does not have administrator access.',
};

export function translator(locale: Locale) {
  return (text: string): string =>
    locale === 'en' ? english[text] || text : text;
}
