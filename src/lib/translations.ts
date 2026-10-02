import type { Locale } from './locale';
import { studioBrand } from './brand';

// Japanese source copy is the key. CMS content without a translation stays original.
export const english: Record<string, string> = {
  星の場所: 'Star lane',
  星: 'Star',
  'ギルガメが主人公のミニゲームを、ブラウザで気軽に遊ぼう。':
    'Play a little browser game starring Gilgame.',
  'ギルガメと、気軽にひと遊び。': 'Take a little play break with Gilgame.',
  '遊びたいゲームを選ぶと、新しいタブで開きます。':
    'Choose a game to play in a new tab.',
  ミニゲーム一覧: 'Mini games list',
  ミニゲーム一覧へ: 'Back to mini games',
  遊ぶ: 'Play',
  ギルガメの星あつめ: 'Gilgame Star Catch',
  '左右に動いて、落ちてくる星をキャッチ。30秒のやさしい星あつめ。':
    'Move left and right to catch falling stars in a gentle 30-second game.',
  星あつめ: 'Star catch',
  '1回30秒': '30 seconds per round',
  やさしい: 'Easy',
  ランニング: 'Running',
  タイミングで挑戦: 'Timing challenge',
  左右に移動: 'Move left and right',
  '星の下へギルガメを動かそう。画面のタップか、← → キーで移動できます。':
    'Move Gilgame under a star. Tap the play area or use the ← → keys.',
  星をキャッチ: 'Catch the stars',
  '星を1つ集めると10点。取り逃しても減点はありません。':
    'Each star is worth 10 points. Missed stars cost no points.',
  '30秒でひと遊び': 'A 30-second play break',
  '時間がきたらスコアをチェック。何度でも気軽に遊べます。':
    'Check your score when time is up, and play again whenever you like.',
  ギルガメを左に移動: 'Move Gilgame left',
  ギルガメを中央に移動: 'Move Gilgame to the center',
  ギルガメを右に移動: 'Move Gilgame right',
  '星あつめ、おつかれさま！': 'Nice star collecting!',
  'ギルガメと星を集めよう。': 'Collect stars with Gilgame.',
  のこり時間: 'Time left',
  秒: 's',
  集めた星: 'Stars collected',
  '星の下へ移動しよう！': 'Move under the star!',
  '準備ができたら、つづけよう。': 'Resume whenever you are ready.',
  '取り逃しても大丈夫。30秒でいくつ集められるかな？':
    'Missing a star is okay. How many can you catch in 30 seconds?',
  もう一度あそぶ: 'Play again',
  星あつめをはじめる: 'Start collecting stars',
  左: 'Left',
  中央: 'Center',
  右: 'Right',
  '画面のタップ・下のボタン・← → キーで移動。P・Escで一時停止。':
    'Tap the play area, use the buttons, or press ← → to move. P or Esc to pause.',
  '星は1つ10点。自己ベストはこのブラウザに保存されます。':
    'Each star is worth 10 points. Your best is saved in this browser.',
  ミニゲーム: 'Mini games',
  'ジャンプとしゃがみでクリスタルを避ける、ブラウザで遊べるミニゲームです。':
    'Jump and duck past the crystals in a little game you can play right in your browser.',
  'ひと息ついたら、ギルガメとひと走り。':
    'Take a break and go for a little run with Gilgame.',
  ダウンロード不要: 'No download needed',
  'PC・スマートフォン対応': 'Play on desktop or mobile',
  遊び方: 'How to play',
  '地面のクリスタルを飛び越えよう。': 'Jump over the crystals on the ground.',
  '浮かぶクリスタルは、低くなって通り抜けよう。':
    'Duck to slip under the floating crystals.',
  記録に挑戦: 'Beat your best',
  '走るほどスコアアップ。自己ベストを更新しよう。':
    'Keep running to build your score. Can you beat your best?',
  'ギルガメと、ひと走り。': 'Ready for a little run with Gilgame?',
  ミニゲームで遊ぶ: 'Play mini games',
  '戻る前に、ギルガメと少し寄り道しませんか？':
    'Before heading back, take a little detour with Gilgame.',
  スコア: 'Score',
  自己ベスト: 'Best',
  ギルガメのランニングゲーム: 'Gilgame running game',
  'スペースキー・↑キー・タップでジャンプ。↓キーでしゃがみます。':
    'Space, ↑, or tap to jump. Hold ↓ to duck.',
  '青いクリスタルを避けよう。P・Escで一時停止。自己ベストはこのブラウザに保存されます。':
    'Avoid the blue crystals. P or Esc to pause. Your best is saved in this browser.',
  'ナイスラン！もう一度、冒険へ。': 'Nice run! Ready for another adventure?',
  'ちょっと、ひと休み。': 'A little break.',
  '迷い道も、小さな冒険。': 'Every detour is a little adventure.',
  避けた障害物: 'Obstacles cleared',
  もう一度遊ぶ: 'Play again',
  つづける: 'Resume',
  冒険をはじめる: 'Start running',
  ジャンプ: 'Jump',
  しゃがむ: 'Duck',
  一時停止: 'Pause',
  'ゲームを遊ぶにはJavaScriptを有効にしてください。':
    'Enable JavaScript to play the game.',
  'このブラウザではゲームを表示できません。ホームから冒険を続けてください。':
    'This browser cannot display the game. Continue your adventure from the homepage.',
  お問い合わせ: 'Contact',
  ストアページを見る: 'Visit store page',
  この作品の開発日誌: 'Development journal for this game',
  この作品の記事をすべて読む: 'Read all stories about this game',
  '紹介・配信向けの素材を見る': 'Press and creator resources',
  この記事のゲーム: 'The game in this story',
  作品: 'Game',
  Steamでウィッシュリストに追加: 'Wishlist on Steam',
  体験版を遊ぶ: 'Play the demo',
  購入する: 'Buy the game',
  冒険のつづきを受け取る: 'Follow the next adventure',
  'RSSで新しい記事をチェックできます。':
    'Follow new stories with your RSS reader.',
  RSSを購読する: 'Subscribe via RSS',
  '紹介や取材に使えるスタジオ情報と作品素材。':
    'Studio information and game assets for press and creators.',
  紹介文をダウンロード: 'Download studio information',
  取材のお問い合わせ: 'Press inquiries',
  ロゴとキャラクター: 'Logo and character',
  スタジオロゴ: 'Studio logo',
  ギルガメ: 'Gilgame',
  画像をダウンロード: 'Download image',
  '素材・配信ガイドライン': 'Asset and streaming guidelines',
  '素材の利用・ゲームの配信については、公式Xへお問い合わせください。':
    'Please contact us on our official X account about asset use and streaming our games.',
  作品ページを見る: 'Visit game page',
  画像を開く: 'Open image',
  ギルガメの図鑑: 'Gilgame discoveries',
  ギルガメを見つける: 'Find Gilgame',
  発見済みのギルガメ: 'Gilgame already found',
  'みつけた！': 'Found you!',
  '小さな足あと…': 'Little footsteps…',
  'ギルガメを見つけました！': 'You found Gilgame!',
  '発見を保存するにはブラウザの保存機能を有効にしてください。':
    'Enable browser storage to save your discoveries.',
  見つけたギルガメ: 'Gilgames found',
  はじめの一歩: 'The first step',
  '新しい冒険の入り口で見つけたギルガメ。':
    'Gilgame, found at the beginning of a new adventure.',
  世界をつくる: 'Creating worlds',
  '小さなアイデアが、遊べる世界になっていく。':
    'Little ideas grow into worlds you can play.',
  寄り道の発見: 'A discovery along the way',
  '制作の足あとには、新しい発見がいっぱい。':
    'Every step of development holds new discoveries.',
  スタジオの相棒: 'The studio companion',
  'きらめく好奇心を持った、小さな相棒。':
    'A little companion with sparkling curiosity.',
  まだ見つけていないギルガメ: 'A Gilgame yet to be found',
  'ページのどこかに、小さな足あと。':
    'Little footsteps, somewhere on the page.',
  もう一度訪れる: 'Visit again',
  探しにいく: 'Go exploring',
  '全部見つけました！ギルガメと一緒に、次の冒険へ。':
    'You found them all! On to the next adventure with Gilgame.',
  '図鑑はこのブラウザに保存されます。':
    'Your discoveries are saved in this browser.',
  図鑑をリセット: 'Reset discoveries',
  '図鑑をリセットしました。': 'Your discoveries have been reset.',
  '図鑑をリセットできませんでした。': 'Your discoveries could not be reset.',
  'サイトに隠れたギルガメを探して、小さな発見を集めよう。':
    'Find the Gilgames hidden around the site and collect little discoveries.',
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
