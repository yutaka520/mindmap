import Link from 'next/link';
import { SimpleMindMapEditor } from '@/components/SimpleMindMapEditor';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="home-page">
        <div className="home-overview home-overview--simple">
          <section className="home-hero home-hero--simple">
            <div className="home-hero__main home-hero__main--simple">
              <p className="home-hero__lead home-hero__lead--simple">
                思考をすばやく整理して、マップごとに残せます。ログイン不要で、つくった内容はすべてこのブラウザに保存されます。
              </p>
              <div className="home-hero__actions">
                <Link href="/editor" className="hero-primary">編集を開く</Link>
              </div>
            </div>
          </section>
        </div>

        <section id="editor" className="editor-stage editor-stage--home">
          <div className="editor-stage__inner">
            <SimpleMindMapEditor mode="embedded" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
