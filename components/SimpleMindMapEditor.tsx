'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import { MindMapCanvas } from '@/components/MindMapCanvas';
import { NodeInspector } from '@/components/NodeInspector';
import {
  clamp,
  createId,
  createProject,
  INITIAL_MAP,
  isMindMap,
  OPPOSITE_SIDE,
  readSavedWorkspace,
  SIDE_META,
  STORAGE_KEY,
} from '@/lib/mindmap';
import {
  LinkDragState,
  MindMap,
  MindMapNode,
  MindMapWorkspace,
  NodeSide,
} from '@/types/mindmap';

type DragState = { id: string; offsetX: number; offsetY: number };
type PanState = { startX: number; startY: number; x: number; y: number };
type HandlePressState = { nodeId: string; side: NodeSide; pointerId: number; clientX: number; clientY: number };

interface SimpleMindMapEditorProps {
  mode?: 'embedded' | 'fullpage';
}

function isHandleTarget(target: EventTarget | null): { nodeId: string; side: NodeSide } | null {
  if (!(target instanceof HTMLElement)) return null;
  const handle = target.closest<HTMLButtonElement>('[data-handle="true"]');
  const nodeId = handle?.dataset.nodeId;
  const side = handle?.dataset.side;
  if (!nodeId || !side || !['top', 'right', 'bottom', 'left'].includes(side)) return null;
  return { nodeId, side: side as NodeSide };
}

function getHandleTargetAtPoint(clientX: number, clientY: number): { nodeId: string; side: NodeSide } | null {
  return isHandleTarget(document.elementFromPoint(clientX, clientY));
}

export function SimpleMindMapEditor({ mode = 'embedded' }: SimpleMindMapEditorProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const panRef = useRef<PanState | null>(null);
  const handlePressRef = useRef<HandlePressState | null>(null);

  const [workspace, setWorkspace] = useState<MindMapWorkspace>(() => ({
    version: 1,
    activeProjectId: 'loading',
    projects: [],
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [linkDrag, setLinkDrag] = useState<LinkDragState | null>(null);
  const [notice, setNotice] = useState('');
  const [showProjectPanel, setShowProjectPanel] = useState(true);
  const [showInspector, setShowInspector] = useState(true);

  const activeProject = workspace.projects.find((project) => project.id === workspace.activeProjectId) ?? workspace.projects[0];
  const map = activeProject?.map ?? INITIAL_MAP;
  const nodesById = useMemo(() => Object.fromEntries(map.nodes.map((node) => [node.id, node])), [map.nodes]);
  const selectedNode = selectedId ? nodesById[selectedId] : undefined;
  const selectedEdge = selectedEdgeId ? map.edges.find((edge) => edge.id === selectedEdgeId) : undefined;

  const showNotice = useCallback((text: string) => {
    setNotice(text);
    window.setTimeout(() => setNotice(''), 1800);
  }, []);

  useEffect(() => {
    const saved = readSavedWorkspace();
    setWorkspace(saved);
    setSelectedId(saved.projects.find((project) => project.id === saved.activeProjectId)?.map.nodes[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (workspace.projects.length > 0) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  }, [workspace]);

  const updateActiveMap = useCallback((updater: (current: MindMap) => MindMap) => {
    setWorkspace((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === current.activeProjectId
        ? { ...project, map: updater(project.map), updatedAt: new Date().toISOString() }
        : project),
    }));
  }, []);

  const selectProject = useCallback((projectId: string) => {
    const project = workspace.projects.find((item) => item.id === projectId);
    if (!project) return;
    setWorkspace((current) => ({ ...current, activeProjectId: projectId }));
    setSelectedId(project.map.nodes[0]?.id ?? null);
    setSelectedEdgeId(null);
    setLinkDrag(null);
  }, [workspace.projects]);

  const createNewProject = useCallback(() => {
    const project = createProject(`マップ ${workspace.projects.length + 1}`);
    setWorkspace((current) => ({ ...current, activeProjectId: project.id, projects: [project, ...current.projects] }));
    setSelectedId(project.map.nodes[0]?.id ?? null);
    setSelectedEdgeId(null);
    showNotice('新しいマップを作成しました。');
  }, [showNotice, workspace.projects.length]);

  const renameActiveProject = useCallback(() => {
    if (!activeProject) return;
    const name = window.prompt('プロジェクト名', activeProject.name)?.trim();
    if (!name) return;
    setWorkspace((current) => ({
      ...current,
      projects: current.projects.map((project) => project.id === activeProject.id ? { ...project, name, updatedAt: new Date().toISOString() } : project),
    }));
  }, [activeProject]);

  const deleteActiveProject = useCallback(() => {
    if (!activeProject) return;
    if (!window.confirm(`「${activeProject.name}」を削除しますか？`)) return;

    const remaining = workspace.projects.filter((project) => project.id !== activeProject.id);
    setWorkspace((current) => {
      const rest = current.projects.filter((project) => project.id !== activeProject.id);
      if (rest.length === 0) {
        const replacement = createProject('はじめのマップ');
        return { version: 1, activeProjectId: replacement.id, projects: [replacement] };
      }
      return { ...current, activeProjectId: rest[0].id, projects: rest };
    });
    setSelectedId(remaining[0]?.map.nodes[0]?.id ?? 'root');
    setSelectedEdgeId(null);
    setLinkDrag(null);
  }, [activeProject, workspace.projects]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedId) return;
    updateActiveMap((current) => ({
      ...current,
      nodes: current.nodes.filter((node) => node.id !== selectedId),
      edges: current.edges.filter((edge) => edge.from !== selectedId && edge.to !== selectedId),
    }));
    setSelectedId(null);
    setLinkDrag(null);
  }, [selectedId, updateActiveMap]);

  const deleteSelectedEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    updateActiveMap((current) => ({ ...current, edges: current.edges.filter((edge) => edge.id !== selectedEdgeId) }));
    setSelectedEdgeId(null);
  }, [selectedEdgeId, updateActiveMap]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify(map, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${activeProject?.name ?? 'mindmap'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [activeProject?.name, map]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedEdgeId) deleteSelectedEdge();
        else if (selectedId) deleteSelectedNode();
      }
      if (event.key === 'Escape') {
        handlePressRef.current = null;
        setLinkDrag(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        exportJson();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [deleteSelectedEdge, deleteSelectedNode, exportJson, selectedEdgeId, selectedId]);

  const getWorldPoint = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (event.clientX - rect.left - map.viewport.x) / map.viewport.zoom,
      y: (event.clientY - rect.top - map.viewport.y) / map.viewport.zoom,
    };
  }, [map.viewport]);

  const updateNode = useCallback((id: string, update: Partial<MindMapNode>) => {
    updateActiveMap((current) => ({ ...current, nodes: current.nodes.map((node) => node.id === id ? { ...node, ...update } : node) }));
  }, [updateActiveMap]);

  const addFreeNode = useCallback(() => {
    const id = createId('node');
    const node: MindMapNode = { id, text: '新しいノード', x: 360 + Math.round(Math.random() * 160), y: 250 + Math.round(Math.random() * 120), color: 'blue' };
    updateActiveMap((current) => ({ ...current, nodes: [...current.nodes, node] }));
    setSelectedId(id);
    setSelectedEdgeId(null);
  }, [updateActiveMap]);

  const addChildNode = useCallback((sourceId: string, side: NodeSide) => {
    const source = nodesById[sourceId];
    if (!source) return;
    const meta = SIDE_META[side];
    const id = createId('node');
    const node: MindMapNode = {
      id,
      text: '新しいノード',
      x: source.x + meta.dx * 260,
      y: source.y + meta.dy * 150,
      color: 'blue',
    };
    updateActiveMap((current) => ({
      ...current,
      nodes: [...current.nodes, node],
      edges: [...current.edges, { id: createId('edge'), from: sourceId, fromSide: side, to: id, toSide: OPPOSITE_SIDE[side] }],
    }));
    setSelectedId(id);
    setSelectedEdgeId(null);
    showNotice('新しいノードを追加しました。');
  }, [nodesById, showNotice, updateActiveMap]);

  const onNodePointerDown = useCallback((event: React.PointerEvent<HTMLElement>, node: MindMapNode) => {
    if (event.button !== 0 || linkDrag || handlePressRef.current) return;
    event.stopPropagation();
    setSelectedId(node.id);
    setSelectedEdgeId(null);
    const point = getWorldPoint(event);
    dragRef.current = { id: node.id, offsetX: point.x - node.x, offsetY: point.y - node.y };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [getWorldPoint, linkDrag]);

  const onBoardPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || linkDrag || handlePressRef.current) return;
    const target = event.target as HTMLElement;
    if (target !== boardRef.current && !target.classList.contains('canvas-surface')) return;
    setSelectedId(null);
    setSelectedEdgeId(null);
    panRef.current = { startX: event.clientX, startY: event.clientY, x: map.viewport.x, y: map.viewport.y };
    boardRef.current?.setPointerCapture?.(event.pointerId);
  }, [linkDrag, map.viewport]);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const handlePress = handlePressRef.current;
    if (handlePress && !linkDrag && event.pointerId === handlePress.pointerId) {
      const moved = Math.hypot(event.clientX - handlePress.clientX, event.clientY - handlePress.clientY);
      if (moved >= 6) {
        const point = getWorldPoint(event);
        setLinkDrag({ nodeId: handlePress.nodeId, side: handlePress.side, pointerX: point.x, pointerY: point.y });
      }
      return;
    }
    if (linkDrag) {
      const point = getWorldPoint(event);
      setLinkDrag((current) => current ? { ...current, pointerX: point.x, pointerY: point.y } : null);
      return;
    }
    if (dragRef.current) {
      const point = getWorldPoint(event);
      const { id, offsetX, offsetY } = dragRef.current;
      updateNode(id, { x: point.x - offsetX, y: point.y - offsetY });
      return;
    }
    if (panRef.current) {
      const pan = panRef.current;
      updateActiveMap((current) => ({ ...current, viewport: { ...current.viewport, x: pan.x + event.clientX - pan.startX, y: pan.y + event.clientY - pan.startY } }));
    }
  }, [getWorldPoint, linkDrag, updateActiveMap, updateNode]);

  const onPointerEnd = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const handlePress = handlePressRef.current;
    if (linkDrag) {
      const target = getHandleTargetAtPoint(event.clientX, event.clientY) ?? isHandleTarget(event.target);
      if (target && target.nodeId !== linkDrag.nodeId) {
        const duplicate = map.edges.some((edge) => edge.from === linkDrag.nodeId && edge.fromSide === linkDrag.side && edge.to === target.nodeId && edge.toSide === target.side);
        if (!duplicate) {
          updateActiveMap((current) => ({
            ...current,
            edges: [...current.edges, { id: createId('edge'), from: linkDrag.nodeId, fromSide: linkDrag.side, to: target.nodeId, toSide: target.side }],
          }));
          showNotice(`${SIDE_META[linkDrag.side].label}側から${SIDE_META[target.side].label}側へ接続しました。`);
        }
      }
    } else if (handlePress && handlePress.pointerId === event.pointerId) {
      addChildNode(handlePress.nodeId, handlePress.side);
    }
    handlePressRef.current = null;
    setLinkDrag(null);
    dragRef.current = null;
    panRef.current = null;
  }, [addChildNode, linkDrag, map.edges, showNotice, updateActiveMap]);

  const onWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const beforeX = (event.clientX - rect.left - map.viewport.x) / map.viewport.zoom;
    const beforeY = (event.clientY - rect.top - map.viewport.y) / map.viewport.zoom;
    const zoom = clamp(map.viewport.zoom * (event.deltaY < 0 ? 1.1 : 0.9), 0.45, 1.9);
    updateActiveMap((current) => ({ ...current, viewport: { zoom, x: event.clientX - rect.left - beforeX * zoom, y: event.clientY - rect.top - beforeY * zoom } }));
  }, [map.viewport, updateActiveMap]);

  const onHandlePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>, nodeId: string, side: NodeSide) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    handlePressRef.current = { nodeId, side, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY };
    setSelectedId(nodeId);
    setSelectedEdgeId(null);
  }, []);

  const onEdgeClick = useCallback((event: React.PointerEvent<SVGPathElement>, edgeId: string) => {
    event.stopPropagation();
    setSelectedId(null);
    setSelectedEdgeId(edgeId);
  }, []);

  const onNodeEdit = useCallback((node: MindMapNode) => {
    const next = window.prompt('ノード名', node.text);
    if (next !== null) updateNode(node.id, { text: next.trim() || '無題ノード' });
  }, [updateNode]);

  const importJson = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!isMindMap(data)) throw new Error('Invalid mind map JSON');
      updateActiveMap(() => data);
      setSelectedId(data.nodes[0]?.id ?? null);
      setSelectedEdgeId(null);
      setLinkDrag(null);
      showNotice('選択中のマップへ読み込みました。');
    } catch {
      showNotice('このJSONは読み込めませんでした。');
    } finally {
      event.target.value = '';
    }
  }, [showNotice, updateActiveMap]);

  const reset = useCallback(() => {
    updateActiveMap(() => structuredClone(INITIAL_MAP));
    setSelectedId('root');
    setSelectedEdgeId(null);
    setLinkDrag(null);
    showNotice('選択中のマップを初期状態に戻しました。');
  }, [showNotice, updateActiveMap]);

  if (!activeProject) return null;

  const workspaceStyle: CSSProperties = {
    gridTemplateColumns: `${showProjectPanel ? '240px' : '0px'} minmax(0, 1fr) ${showInspector ? '260px' : '0px'}`,
  };

  return (
    <div className={`editor-shell editor-shell--${mode}`}>
      <header className="editor-topbar">
        <div className="editor-heading">
          <p className="editor-kicker">Simple, local</p>
          <h2>マインドマップ編集</h2>
          <p className="editor-summary">
            {mode === 'fullpage' ? 'ブラウザ保存 · JSON入出力 · 広い編集画面' : 'ブラウザ保存 · JSON入出力'}
          </p>
        </div>
        <div className="editor-toolbar">
          <button type="button" className="secondary" onClick={() => setShowProjectPanel((current) => !current)}>
            {showProjectPanel ? '一覧を閉じる' : '一覧を開く'}
          </button>
          <button type="button" className="secondary" onClick={() => setShowInspector((current) => !current)}>
            {showInspector ? '詳細を閉じる' : '詳細を開く'}
          </button>
          {mode === 'embedded' && (
            <Link href="/editor" className="editor-toolbar__link">
              別画面で開く
            </Link>
          )}
          <button type="button" onClick={addFreeNode}>＋ ノード</button>
          <button type="button" className="secondary" onClick={exportJson}>書き出し</button>
          <button type="button" className="secondary" onClick={() => fileInputRef.current?.click()}>読み込み</button>
          <button type="button" className="secondary" onClick={reset}>リセット</button>
          <input ref={fileInputRef} onChange={importJson} type="file" accept="application/json" hidden />
        </div>
      </header>

      <section className="editor-workspace" style={workspaceStyle}>
        <aside className={`project-panel ${showProjectPanel ? '' : 'is-collapsed'}`}>
          <div className="panel-heading">
            <h3>マップ一覧</h3>
            <button type="button" className="add-project" onClick={createNewProject} aria-label="新しいプロジェクト">＋</button>
          </div>
          <div className="project-list">
            {workspace.projects.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => selectProject(project.id)}
                className={`project-item ${project.id === activeProject.id ? 'active' : ''}`}
              >
                {project.name}
              </button>
            ))}
          </div>
          <button type="button" className="project-action" onClick={renameActiveProject}>名前を変更</button>
          <button type="button" className="project-action danger-outline" onClick={deleteActiveProject}>マップを削除</button>
          <div className="help-copy">
            <h3>操作ガイド</h3>
            <p>ノード四方の<strong>＋</strong>をクリックすると、その方向にノードを追加して自動接続します。</p>
            <p><strong>＋</strong>を別ノードの<strong>＋</strong>へドラッグすると、既存ノード同士を接続できます。</p>
            <p>保存先はこのブラウザの Local Storage です。サーバーDBは利用しません。</p>
            {linkDrag && <div className="linking-status">接続中：他ノードの＋へドロップ</div>}
          </div>
        </aside>

        <div className="editor-canvas">
          <MindMapCanvas
            map={map}
            selectedId={selectedId}
            selectedEdgeId={selectedEdgeId}
            linkDrag={linkDrag}
            boardRef={boardRef}
            onBoardPointerDown={onBoardPointerDown}
            onPointerMove={onPointerMove}
            onPointerEnd={onPointerEnd}
            onWheel={onWheel}
            onNodePointerDown={onNodePointerDown}
            onHandlePointerDown={onHandlePointerDown}
            onEdgeClick={onEdgeClick}
            onNodeEdit={onNodeEdit}
          />
          {(!showProjectPanel || !showInspector) && (
            <div className="editor-canvas__status">
              {!showProjectPanel && <span>一覧を閉じています</span>}
              {!showInspector && <span>詳細を閉じています</span>}
            </div>
          )}
        </div>

        <div className={`editor-inspector-wrap ${showInspector ? '' : 'is-collapsed'}`}>
          <NodeInspector
            node={selectedNode}
            edge={selectedEdge}
            onTextChange={(id, text) => updateNode(id, { text })}
            onColorChange={(id, color) => updateNode(id, { color })}
            onDeleteNode={deleteSelectedNode}
            onDeleteEdge={deleteSelectedEdge}
          />
        </div>
      </section>
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}
