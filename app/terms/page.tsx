import type { Metadata } from 'next';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { LEGAL_UPDATED_AT, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '利用規約',
  description: `${SITE_NAME}の利用規約です。`,
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal-page">
        <article className="legal-layout">
          <div className="legal-heading">
            <p className="legal-kicker">Terms of Use</p>
            <h1>利用規約</h1>
            <p>
              この利用規約は、{SITE_NAME}の利用条件を定めるものです。
              本アプリを利用した時点で、本規約に同意したものとみなします。
            </p>
            <p className="legal-updated">最終更新日: {LEGAL_UPDATED_AT}</p>
          </div>

          <section className="legal-section">
            <h2>1. 適用範囲</h2>
            <p>
              本規約は、本アプリの閲覧、編集、書き出し、読み込みその他一切の利用に適用されます。
            </p>
          </section>

          <section className="legal-section">
            <h2>2. 提供内容</h2>
            <p>
              本アプリは、ブラウザ内にマインドマップを保存しながら編集できるローカルファーストのツールとして提供されます。
              サーバー側のデータベース保存やアカウント機能は提供しません。
            </p>
          </section>

          <section className="legal-section">
            <h2>3. 利用者の責任</h2>
            <ul>
              <li>利用者は、自らの責任でデータの管理とバックアップを行うものとします。</li>
              <li>JSON 書き出しやブラウザ設定の管理を含め、保存データの保持は利用者が行うものとします。</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. 禁止事項</h2>
            <ul>
              <li>法令または公序良俗に反する行為</li>
              <li>本アプリまたは第三者の権利・利益を侵害する行為</li>
              <li>本アプリの運営を妨害する行為、または不正なアクセスを試みる行為</li>
              <li>マルウェアの配布、過度な負荷の発生、その他安全性を損なう行為</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>5. 知的財産権</h2>
            <p>
              本アプリのデザイン、プログラム、ロゴその他運営者が作成した要素に関する権利は、運営者または正当な権利者に帰属します。
              利用者が入力したマインドマップの内容に関する権利は、当該利用者に留保されます。
            </p>
          </section>

          <section className="legal-section">
            <h2>6. 変更・停止</h2>
            <p>
              運営者は、必要に応じて本アプリの仕様変更、一時停止、提供終了を行うことがあります。
              非営利かつ個人利用を前提とした公開であるため、継続提供を保証するものではありません。
            </p>
          </section>

          <section className="legal-section">
            <h2>7. 免責事項</h2>
            <ul>
              <li>本アプリは現状有姿で提供され、完全性、継続性、特定目的適合性を保証しません。</li>
              <li>ブラウザ障害、端末故障、誤操作、環境変更等によるデータ消失について、運営者は責任を負いません。</li>
              <li>Google Analytics など第三者サービスの利用に起因する事項は、当該第三者の定めに従います。</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. 規約変更</h2>
            <p>
              本規約は、必要に応じて改定されることがあります。改定後の規約は、本ページに掲載した時点で効力を生じます。
            </p>
          </section>

          <section className="legal-section">
            <h2>9. 準拠</h2>
            <p>
              本規約の解釈は日本法に準拠します。本アプリに関する問い合わせは、
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
