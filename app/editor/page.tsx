import type { Metadata } from 'next';
import { SimpleMindMapEditor } from '@/components/SimpleMindMapEditor';
import { SiteHeader } from '@/components/SiteHeader';
import { SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
  title: '編集',
  description: `${SITE_NAME}の編集画面です。`,
};

export default function EditorPage() {
  return (
    <>
      <SiteHeader />
      <main className="editor-page">
        <div className="editor-page__body">
          <SimpleMindMapEditor mode="fullpage" />
        </div>
      </main>
    </>
  );
}
