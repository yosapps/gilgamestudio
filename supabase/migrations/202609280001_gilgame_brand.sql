-- Brand-only update. Does not alter content, administrator roles, or SNS links.
update public.site_settings set
  site_name='Gilgame studio',
  description='小さな一歩から、きらめく冒険へ。ギルガメとともに、思わず笑顔になるゲームをつくる個人開発スタジオ。',
  profile='Gilgame studioは、小さな「やってみたい」をゲームにする個人開発スタジオです。水色のからだと金色の甲羅、額にきらめくクリスタルが目印の「ギルガメ」と一緒に、発見する楽しさ、できたときのうれしさ、また会いたくなる世界を大切につくっています。',
  og_image='/logo.png'
where id=1;
