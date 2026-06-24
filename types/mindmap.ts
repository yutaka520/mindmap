export const NODE_WIDTH = 176;
export const NODE_HEIGHT = 76;

export const SIDES = ['top', 'right', 'bottom', 'left'] as const;
export type NodeSide = (typeof SIDES)[number];

export const NODE_COLORS = ['blue', 'amber', 'violet', 'root'] as const;
export type NodeColor = (typeof NODE_COLORS)[number];

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: NodeColor;
}

export interface MindMapEdge {
  id: string;
  from: string;
  fromSide: NodeSide;
  to: string;
  toSide: NodeSide;
}

export interface MindMap {
  viewport: Viewport;
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

export interface MindMapProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  map: MindMap;
}

export interface MindMapWorkspace {
  version: 1;
  activeProjectId: string;
  projects: MindMapProject[];
}

export interface SideMeta {
  x: number;
  y: number;
  dx: number;
  dy: number;
  label: string;
}

/** ドラッグ中だけ存在する、未確定の接続線。 */
export interface LinkDragState {
  nodeId: string;
  side: NodeSide;
  pointerX: number;
  pointerY: number;
}
