# サンプルアートの出典

実在するゲーム作品の画像ではありません。開発用の架空作品を表示するため、組み込みimage_genで生成したコンセプトアートです。公開前に作品情報とともに差し替えてください。

- `public/art/void.png`: ECHOES OF THE VOID。Prompt: “Premium 16:9 atmospheric 3D indie game art; abandoned brutalist observatory on alien moon, immense violet eclipse, tiny lone traveler, cyan luminous mist, dark navy shadows, weathered concrete and moon rock, monumental scale, no text/logos/watermarks.”
- `public/art/afterglow.png`: AFTERGLOW。Prompt: “Premium 16:9 atmospheric 3D indie exploration game art; ruined orbital botanical greenhouse, warm amber sunbeams, tiny lone exploring robot, lush teal foliage, broken curved structural ribs, weathered white metal and shattered glass, tranquil discovery, no text/logos/watermarks.”
- `public/art/orbit.svg`: ヒーロー用の幾何学的な静止フォールバック。3DはReact Three Fiberで実装。

英数字はSpace Grotesk、日本語はNoto Sans JP。`@fontsource-variable`からローカル配信し、閲覧時にGoogle Fontsへの通信は行いません。ライセンスは各npmパッケージ内のOFLを参照。

## GILGAME RUNのアニメーション素材

- `public/game/gilgame-runner-sheet.png`: 404ゲーム専用の透過PNG。既存の `public/gilgame.png` を参照し、組み込みimage_genで走る・ジャンプ・しゃがむ各6コマ、計18コマを生成。1774×887px、約1.4MB。元のキャラクター画像も生成元ファイルも保持しています。
- 生成指示の全文: [gilgame-runner-animation.prompt.txt](gilgame-runner-animation.prompt.txt)。
- `src/lib/gilgame-runner-atlas.json` に実際のポーズ位置と足元の基準を保存。描画時にフレームを選び、同じ動作内では倍率を固定して縦横比を保ちます。
- 走る・しゃがむは6コマのループ、ジャンプは物理状態に合わせた離陸・上昇・頂点・下降・着地。停止中は表示コマを保持。モーション抑制設定ではループせず動作に合う静止ポーズを表示します。
