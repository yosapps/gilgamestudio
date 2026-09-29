import { getTranslator } from '@/lib/locale-server';
import { ArrowUpRight, MessageCircle } from 'lucide-react';
import { XIcon } from '@/components/official-x';
import { studioBrand } from '@/lib/brand';
export async function generateMetadata() {
  const t = await getTranslator();
  return {
    title: 'Contact',
    description: t(
      'ゲームやコラボレーション、取材に関するお問い合わせは、公式X（@gilgamestudio）のダイレクトメッセージへ。',
    ),
  };
}
export default async function Contact() {
  const t = await getTranslator();
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">START A CONVERSATION</p>
        <h1>
          {t('何か、')}
          <br />
          {t('面白いことを一緒に。')}
        </h1>
      </div>
      <div className="contact-layout">
        <div>
          <h2>{t('お問い合わせは、XのDMへ。')}</h2>
          <p>
            {t('ゲームについてのご質問、制作のご相談、')}
            <br />
            {t('コラボレーションや取材のご依頼はこちらへ。')}
          </p>
          <p className="muted">
            {t(
              '公式アカウントのプロフィールを開き、メッセージボタンからDMをお送りください。',
            )}
          </p>
          <p className="muted">
            {t('ご相談内容や関連するURLなどを添えていただけるとスムーズです。')}
          </p>
        </div>
        <div className="contact-x-card">
          <div className="contact-x-icon">
            <XIcon />
          </div>
          <p className="eyebrow">LET’S TALK ON X</p>
          <h2>{studioBrand.name}</h2>
          <p className="contact-x-handle">{studioBrand.x.handle}</p>
          <p>
            {t('ゲームのことも、新しいアイデアも。')}
            <br />
            {t('まずはDMで、お気軽にご相談ください。')}
          </p>
          <a
            className="button button-primary"
            href={studioBrand.x.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('公式Xを開く（新しいタブで開きます）')}
          >
            <MessageCircle size={18} aria-hidden="true" />
            {t('公式Xを開く')}
            <ArrowUpRight size={18} aria-hidden="true" />
          </a>
          <p className="contact-x-note">
            {t('DMの送信にはXへのログインが必要です。')}
          </p>
        </div>
      </div>
    </div>
  );
}
