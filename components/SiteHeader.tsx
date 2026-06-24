import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

const navItems = [
  { href: '/editor', label: '編集' },
  { href: '/terms', label: '利用規約' },
  { href: '/privacy', label: 'プライバシー' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand">
          <img src="/simple-mind-map-mark.svg" alt="" aria-hidden="true" className="brand-mark" />
          <div className="brand-copy">
            <span className="brand-name">{SITE_NAME}</span>
            <span className="brand-note">ローカル保存で考えをつなぐ</span>
          </div>
        </Link>

        <nav className="site-nav" aria-label="グローバルナビゲーション">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="site-nav__link">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href="/editor" className="site-cta">
          今すぐ使う
        </Link>
      </div>
    </header>
  );
}
