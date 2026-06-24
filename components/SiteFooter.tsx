import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner site-footer__inner--compact">
        <div className="site-footer__meta">
          <p className="site-footer__copyright">© {currentYear} {SITE_NAME}</p>
          <p className="site-footer__credit">
            created by{' '}
            <a href="https://yutaka-create.com" target="_blank" rel="noreferrer">
              Yutaka Tanabe
            </a>
          </p>
        </div>

        <div className="site-footer__links">
          <Link href="/editor">編集</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </div>
      </div>
    </footer>
  );
}
