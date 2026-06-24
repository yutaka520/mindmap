import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner site-footer__inner--compact">
        <div className="site-footer__links">
          <Link href="/editor">編集</Link>
          <Link href="/terms">利用規約</Link>
          <Link href="/privacy">プライバシーポリシー</Link>
        </div>
      </div>
    </footer>
  );
}
