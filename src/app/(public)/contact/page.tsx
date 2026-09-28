import { ContactForm } from '@/components/contact-form';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Contact',
  description: 'ゲームやコラボレーション、取材に関するお問い合わせ。',
};
export default function Contact() {
  const enabled = !!(
    process.env.RESEND_API_KEY &&
    process.env.CONTACT_FROM &&
    process.env.CONTACT_TO &&
    process.env.CONTACT_RATE_LIMIT_SECRET &&
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
  return (
    <div className="page-wrap">
      <div className="page-intro">
        <p className="eyebrow">START A CONVERSATION</p>
        <h1>
          何か、
          <br />
          面白いことを一緒に。
        </h1>
      </div>
      <div className="contact-layout">
        <div>
          <h2>Contact</h2>
          <p>
            ゲームについてのご質問、制作のご相談、
            <br />
            コラボレーションや取材のご依頼はこちらへ。
          </p>
          <p className="muted">
            入力内容はお問い合わせへの返信にのみ使用します。
          </p>
          {!enabled && (
            <p className="notice">
              お問い合わせフォームは準備中です。現在、メール配信サービスが設定されていません。
            </p>
          )}
        </div>
        <ContactForm enabled={enabled} />
      </div>
    </div>
  );
}
