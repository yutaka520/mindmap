import {
  MindMap,
  MindMapEdge,
  MindMapNode,
  MindMapProject,
  MindMapWorkspace,
  NodeSide,
  SideMeta,
  NODE_HEIGHT,
  NODE_WIDTH,
} from '@/types/mindmap';

export const STORAGE_KEY = 'simple-mind-map-workspace-v5';
const LEGACY_STORAGE_KEYS = ['mindmap-nextjs-local-workspace-v4', 'mindmap-nextjs-local-v3'];

export const SIDE_META: Record<NodeSide, SideMeta> = {
  top: { x: 0.5, y: 0, dx: 0, dy: -1, label: '上' },
  right: { x: 1, y: 0.5, dx: 1, dy: 0, label: '右' },
  bottom: { x: 0.5, y: 1, dx: 0, dy: 1, label: '下' },
  left: { x: 0, y: 0.5, dx: -1, dy: 0, label: '左' },
};

export const OPPOSITE_SIDE: Record<NodeSide, NodeSide> = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

export const INITIAL_MAP: MindMap = {
  viewport: { x: 170, y: 110, zoom: 1 },
  nodes: [
    { id: 'root', text: '中心テーマ', x: 410, y: 260, color: 'root' },
  ],
  edges: [],
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createProject(name = '新しいマインドマップ', map: MindMap = structuredClone(INITIAL_MAP)): MindMapProject {
  const now = new Date().toISOString();
  return { id: createId('project'), name, createdAt: now, updatedAt: now, map };
}

export function createInitialWorkspace(): MindMapWorkspace {
  const firstProject = createProject('はじめのマップ');
  return { version: 1, activeProjectId: firstProject.id, projects: [firstProject] };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function pointFor(node: MindMapNode, side: NodeSide): { x: number; y: number } {
  const meta = SIDE_META[side];
  return { x: node.x + NODE_WIDTH * meta.x, y: node.y + NODE_HEIGHT * meta.y };
}

export function edgePath(fromNode: MindMapNode, fromSide: NodeSide, toNode: MindMapNode, toSide: NodeSide): string {
  const start = pointFor(fromNode, fromSide);
  const end = pointFor(toNode, toSide);
  const startMeta = SIDE_META[fromSide];
  const endMeta = SIDE_META[toSide];
  const distance = Math.max(54, Math.min(220, Math.hypot(end.x - start.x, end.y - start.y) * 0.45));
  const control1 = { x: start.x + startMeta.dx * distance, y: start.y + startMeta.dy * distance };
  const control2 = { x: end.x + endMeta.dx * distance, y: end.y + endMeta.dy * distance };
  return `M ${start.x} ${start.y} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${end.x} ${end.y}`;
}

export function previewEdgePath(fromNode: MindMapNode, fromSide: NodeSide, pointer: { x: number; y: number }): string {
  const start = pointFor(fromNode, fromSide);
  const meta = SIDE_META[fromSide];
  const distance = Math.max(54, Math.min(220, Math.hypot(pointer.x - start.x, pointer.y - start.y) * 0.42));
  const control = { x: start.x + meta.dx * distance, y: start.y + meta.dy * distance };
  return `M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${pointer.x} ${pointer.y}`;
}

export function isMindMap(value: unknown): value is MindMap {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MindMap>;
  if (!candidate.viewport || !Array.isArray(candidate.nodes) || !Array.isArray(candidate.edges)) return false;
  return candidate.nodes.every((node) => {
    const item = node as Partial<MindMapNode>;
    return typeof item.id === 'string' && typeof item.text === 'string' && typeof item.x === 'number' && typeof item.y === 'number'
      && ['blue', 'amber', 'violet', 'root'].includes(item.color ?? 'blue');
  }) && candidate.edges.every((edge) => {
    const item = edge as Partial<MindMapEdge>;
    return typeof item.id === 'string' && typeof item.from === 'string' && typeof item.to === 'string'
      && ['top', 'right', 'bottom', 'left'].includes(item.fromSide ?? '')
      && ['top', 'right', 'bottom', 'left'].includes(item.toSide ?? '');
  });
}

function isWorkspace(value: unknown): value is MindMapWorkspace {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<MindMapWorkspace>;
  return candidate.version === 1 && typeof candidate.activeProjectId === 'string' && Array.isArray(candidate.projects)
    && candidate.projects.length > 0
    && candidate.projects.every((project) => {
      const item = project as Partial<MindMapProject>;
      return typeof item.id === 'string' && typeof item.name === 'string' && isMindMap(item.map);
    });
}

export function readSavedWorkspace(): MindMapWorkspace {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (isWorkspace(parsed)) return parsed;
    }
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = window.localStorage.getItem(key);
      if (!legacy) continue;
      const parsed: unknown = JSON.parse(legacy);
      if (isWorkspace(parsed)) return parsed;
      if (isMindMap(parsed)) {
        const migrated = createProject('以前のマップ', parsed);
        return { version: 1, activeProjectId: migrated.id, projects: [migrated] };
      }
    }
  } catch {
    // 壊れた保存値は無視して初期状態へ戻す。
  }
  return createInitialWorkspace();
}
