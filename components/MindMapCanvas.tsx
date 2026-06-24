'use client';

import { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { edgePath, previewEdgePath, SIDE_META } from '@/lib/mindmap';
import { LinkDragState, MindMap, MindMapNode, NodeSide, SIDES } from '@/types/mindmap';

interface MindMapCanvasProps {
  map: MindMap;
  selectedId: string | null;
  selectedEdgeId: string | null;
  linkDrag: LinkDragState | null;
  boardRef: React.RefObject<HTMLDivElement | null>;
  onBoardPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onPointerEnd: (event: ReactPointerEvent<HTMLDivElement>) => void;
  onWheel: (event: ReactWheelEvent<HTMLDivElement>) => void;
  onNodePointerDown: (event: ReactPointerEvent<HTMLElement>, node: MindMapNode) => void;
  onHandlePointerDown: (event: ReactPointerEvent<HTMLButtonElement>, nodeId: string, side: NodeSide) => void;
  onEdgeClick: (event: ReactPointerEvent<SVGPathElement>, edgeId: string) => void;
  onNodeEdit: (node: MindMapNode) => void;
}

export function MindMapCanvas({
  map,
  selectedId,
  selectedEdgeId,
  linkDrag,
  boardRef,
  onBoardPointerDown,
  onPointerMove,
  onPointerEnd,
  onWheel,
  onNodePointerDown,
  onHandlePointerDown,
  onEdgeClick,
  onNodeEdit,
}: MindMapCanvasProps) {
  const nodesById = Object.fromEntries(map.nodes.map((node) => [node.id, node]));
  const linkSource = linkDrag ? nodesById[linkDrag.nodeId] : undefined;

  return (
    <div
      ref={boardRef}
      className={`board ${linkDrag ? 'is-linking' : ''}`}
      onPointerDown={onBoardPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onWheel={onWheel}
    >
      <div
        className="canvas-surface"
        style={{ transform: `translate(${map.viewport.x}px, ${map.viewport.y}px) scale(${map.viewport.zoom})` }}
      >
        <svg className="edges" width="2200" height="1500" viewBox="0 0 2200 1500" aria-hidden="true">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="arrow-head" />
            </marker>
          </defs>
          {map.edges.map((edge) => {
            const from = nodesById[edge.from];
            const to = nodesById[edge.to];
            if (!from || !to) return null;

            return (
              <path
                key={edge.id}
                className={`edge ${selectedEdgeId === edge.id ? 'selected' : ''}`}
                d={edgePath(from, edge.fromSide, to, edge.toSide)}
                markerEnd="url(#arrow)"
                onPointerDown={(event) => onEdgeClick(event, edge.id)}
              />
            );
          })}
          {linkSource && linkDrag && (
            <path
              className="edge edge-preview"
              d={previewEdgePath(linkSource, linkDrag.side, { x: linkDrag.pointerX, y: linkDrag.pointerY })}
            />
          )}
        </svg>

        {map.nodes.map((node) => (
          <article
            className={`node ${node.color} ${selectedId === node.id ? 'selected' : ''}`}
            key={node.id}
            style={{ left: node.x, top: node.y }}
            onPointerDown={(event) => onNodePointerDown(event, node)}
          >
            {SIDES.map((side) => (
              <button
                key={side}
                type="button"
                data-handle="true"
                data-node-id={node.id}
                data-side={side}
                className={`handle ${side} ${linkDrag?.nodeId === node.id && linkDrag.side === side ? 'active' : ''}`}
                title={`${SIDE_META[side].label}側からドラッグして接続`}
                aria-label={`${node.text}の${SIDE_META[side].label}側からドラッグして接続`}
                onPointerDown={(event) => onHandlePointerDown(event, node.id, side)}
              >
                ＋
              </button>
            ))}
            <div className="node-title" onDoubleClick={() => onNodeEdit(node)}>
              {node.text}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
