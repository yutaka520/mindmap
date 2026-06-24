import type { Metadata } from 'next';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { LEGAL_UPDATED_AT, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: `${SITE_NAME}のプライバシーポリシーです。`,
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <article className="legal-layout">
          <div className="legal-heading">
            <p className="legal-kicker">Privacy Policy</p>
            <h1>プライバシーポリシー</h1>
            <p>
              {SITE_NAME}は、個人利用を前提にしたローカル保存型アプリです。本ポリシーでは、
              本アプリが取り扱う情報と、その扱い方を定めます。
            </p>
            <p className="legal-updated">最終更新日: {LEGAL_UPDATED_AT}</p>
          </div>

          <section className="legal-section">
            <h2>1. 取得する情報</h2>
            <p>本アプリでは、次の情報を取り扱います。</p>
            <ul>
              <li>ユーザーが作成したマインドマップの内容、配置、接続情報、表示状態</li>
              <li>Google Analytics により収集される利用状況情報</li>
              <li>ブラウザ、端末、参照元、閲覧ページ、アクセス時刻などの技術情報</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. 保存方法</h2>
            <p>
              マインドマップ本文や構造データは、ユーザーのブラウザ内の Local Storage に保存されます。
              本アプリはサーバー側のデータベースを設けておらず、マップ本文を運営者サーバーへ送信しません。
            </p>
          </section>

          <section className="legal-section">
            <h2>3. 利用目的</h2>
            <ul>
              <li>アプリの表示、編集、保存、書き出し、読み込みのため</li>
              <li>利用状況を把握し、UI や機能改善に役立てるため</li>
              <li>障害調査、不正利用対策、品質維持のため</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Google Analytics の利用</h2>
            <p>
              本アプリでは、環境変数に Google Analytics の測定 ID が設定されている場合に限り、
              Google Analytics を利用します。Google Analytics は Cookie 等を利用して利用状況を収集する場合があります。
            </p>
            <p>
              収集された情報の取り扱いは Google の定める条件に従います。詳細は Google の関連ポリシーをご確認ください。
            </p>
          </section>

          <section className="legal-section">
            <h2>5. 第三者提供</h2>
            <p>
              本アプリは、法令に基づく場合を除き、ユーザーの個人情報を第三者へ提供しません。
              ただし、Google Analytics を有効にしている場合、利用状況情報は Google に送信されることがあります。
            </p>
          </section>

          <section className="legal-section">
            <h2>6. ユーザーによる管理</h2>
            <ul>
              <li>Local Storage に保存されたデータは、ブラウザ設定や開発者ツールから削除できます。</li>
              <li>Google Analytics による収集を制限したい場合は、ブラウザの Cookie 設定や追跡防止機能等をご利用ください。</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. 改定</h2>
            <p>
              本ポリシーは、機能追加や法令変更に応じて改定することがあります。改定後は、本ページへ掲載した時点で効力を生じます。
            </p>
          </section>

          <section className="legal-section">
            <h2>8. 連絡先</h2>
            <p>
              本アプリに関する問い合わせは、
              <a href="https://yutaka-create.com/#contact" target="_blank" rel="noreferrer">
                https://yutaka-create.com/#contact
              </a>
              をご利用ください。
            </p>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
