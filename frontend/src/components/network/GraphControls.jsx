/**
 * GraphControls — UI controls for Cytoscape.js viewport actions.
 * Receives a cyRef (the cy core instance ref) from the parent.
 * Does NOT modify graph data — only controls camera/layout.
 */
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Crosshair } from 'lucide-react';

export default function GraphControls({ cyRef, layout, onResetLayout }) {
  const zoomIn = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const zoomOut = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
  };

  const fitGraph = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.fit(undefined, 40);
  };

  const centerSelected = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const selected = cy.$(':selected');
    if (selected.length > 0) {
      cy.fit(selected, 80);
    } else {
      cy.fit(undefined, 40);
    }
  };

  const btnClass =
    'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white border border-slate-200 ' +
    'text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors';

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-t border-slate-200">
      <button className={btnClass} onClick={zoomIn} title="Zoom In">
        <ZoomIn size={13} /> Zoom In
      </button>
      <button className={btnClass} onClick={zoomOut} title="Zoom Out">
        <ZoomOut size={13} /> Zoom Out
      </button>
      <button className={btnClass} onClick={fitGraph} title="Fit graph to viewport">
        <Maximize2 size={13} /> Fit Graph
      </button>
      <button className={btnClass} onClick={onResetLayout} title="Reset layout">
        <RotateCcw size={13} /> Reset Layout
      </button>
      <button className={btnClass} onClick={centerSelected} title="Center on selected node">
        <Crosshair size={13} /> Center Selected
      </button>
    </div>
  );
}
