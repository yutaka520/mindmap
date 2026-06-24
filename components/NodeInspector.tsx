import { MindMapEdge, MindMapNode, NodeColor } from '@/types/mindmap';

interface NodeInspectorProps {
  node?: MindMapNode;
  edge?: MindMapEdge;
  onTextChange: (id: string, text: string) => void;
  onColorChange: (id: string, color: NodeColor) => void;
  onDeleteNode: () => void;
  onDeleteEdge: () => void;
}

export function NodeInspector({
  node,
  edge,
  onTextChange,
  onColorChange,
  onDeleteNode,
  onDeleteEdge,
}: NodeInspectorProps) {
  if (edge) {
    return (
      <aside className="editor-inspector">
        <h2>エッジ</h2>
        <p className="muted">エッジを選択中です。Delete / Backspace キーでも削除できます。</p>
        <button type="button" className="danger" onClick={onDeleteEdge}>選択エッジを削除</button>
      </aside>
    );
  }

  return (
    <aside className="editor-inspector">
      <h2>ノード</h2>
      {node ? (
        <>
          <label>
            テキスト
            <textarea value={node.text} onChange={(event) => onTextChange(node.id, event.target.value)} />
          </label>
          <label>
            色
            <select value={node.color} onChange={(event) => onColorChange(node.id, event.target.value as NodeColor)}>
              <option value="blue">ブルー</option>
              <option value="amber">アンバー</option>
              <option value="violet">バイオレット</option>
              <option value="root">グリーン</option>
            </select>
          </label>
          <button type="button" className="danger" onClick={onDeleteNode}>選択ノードを削除</button>
        </>
      ) : (
        <p className="muted">ノードまたはエッジを選択してください。</p>
      )}
    </aside>
  );
}
