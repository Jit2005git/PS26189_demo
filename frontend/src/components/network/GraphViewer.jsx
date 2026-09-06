/**
 * GraphViewer — wraps Cytoscape.js for investigation network visualization.
 *
 * DATA INTEGRITY:
 * - Accepts `elements` from the API response only (GET /api/cases/{case_id}/graph)
 * - Does NOT create, modify, infer, or calculate any nodes/edges/relationships
 * - Does NOT calculate confidence, priority, or analytics
 * - Only visualizes what the backend returns
 *
 * PERFORMANCE:
 * - Uses a persistent CytoscapeComponent; updates elements via cy.json() when props change
 * - Cleans up event listeners on unmount
 */
import { useEffect, useRef, useCallback } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';

// Node type → visual style mapping (color + shape so it's not color-only)
const TYPE_STYLES = {
  CASE:         { color: '#6366f1', shape: 'hexagon',   size: 60 },
  PERSON:       { color: '#0ea5e9', shape: 'ellipse',   size: 48 },
  PHONE:        { color: '#10b981', shape: 'triangle',  size: 44 },
  BANK_ACCOUNT: { color: '#f59e0b', shape: 'diamond',   size: 48 },
  VEHICLE:      { color: '#8b5cf6', shape: 'rectangle', size: 44 },
  LOCATION:     { color: '#ef4444', shape: 'vee',       size: 44 },
  ORGANIZATION: { color: '#ec4899', shape: 'star',      size: 48 },
  UNKNOWN:      { color: '#94a3b8', shape: 'ellipse',   size: 40 },
};

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.UNKNOWN;
}

// Build Cytoscape stylesheet
const STYLESHEET = [
  {
    selector: 'node',
    style: {
      'background-color': (ele) => getTypeStyle(ele.data('type')).color,
      'shape': (ele) => getTypeStyle(ele.data('type')).shape,
      'width': (ele) => getTypeStyle(ele.data('type')).size,
      'height': (ele) => getTypeStyle(ele.data('type')).size,
      'label': 'data(label)',
      'font-size': '10px',
      'color': '#1e293b',
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 4,
      'text-max-width': '80px',
      'text-wrap': 'ellipsis',
      'border-width': 2,
      'border-color': (ele) => getTypeStyle(ele.data('type')).color,
      'border-opacity': 0.7,
      'background-opacity': 0.9,
      'transition-property': 'border-width, border-color, background-opacity',
      'transition-duration': '150ms',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#1e40af',
      'background-opacity': 1,
      'z-index': 999,
    },
  },
  {
    selector: 'node:active',
    style: {
      'overlay-opacity': 0.1,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#94a3b8',
      'target-arrow-color': '#94a3b8',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(relationship_type)',
      'font-size': '9px',
      'color': '#64748b',
      'text-rotation': 'autorotate',
      'text-margin-y': -6,
      'text-background-color': '#f8fafc',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'opacity': 0.8,
      'transition-property': 'line-color, opacity, width',
      'transition-duration': '150ms',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#3b82f6',
      'target-arrow-color': '#3b82f6',
      'width': 3,
      'opacity': 1,
      'z-index': 999,
    },
  },
  {
    selector: '.dimmed',
    style: {
      'opacity': 0.2,
    },
  },
];

const LAYOUT = {
  name: 'cose',
  animate: false,         // no animation per requirements
  randomize: false,
  componentSpacing: 80,
  nodeRepulsion: () => 8000,
  nodeOverlap: 20,
  idealEdgeLength: () => 100,
  edgeElasticity: () => 100,
  nestingFactor: 5,
  gravity: 80,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
};

export default function GraphViewer({ elements, onNodeSelect, onEdgeSelect, cyRef }) {
  const layoutRef = useRef(null);

  // Run layout whenever elements change
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;
    if (layoutRef.current) {
      try { layoutRef.current.stop(); } catch (_) {}
    }
    layoutRef.current = cy.layout(LAYOUT);
    layoutRef.current.run();
  }, [cyRef]);

  // Attach event listeners once the cy instance is available
  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;

    // Node tap → select and notify parent
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      cy.elements().removeClass('dimmed');
      cy.$(':selected').unselect();
      node.select();
      node.neighborhood().not(node).addClass(''); // ensure neighbors visible
      onNodeSelect?.({ elementType: 'node', data: node.data() });
    });

    // Edge tap → select and notify parent
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      cy.$(':selected').unselect();
      edge.select();
      onEdgeSelect?.({ elementType: 'edge', data: edge.data() });
    });

    // Background tap → deselect all
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed');
        cy.$(':selected').unselect();
        onNodeSelect?.(null);
        onEdgeSelect?.(null);
      }
    });
  }, [cyRef, onNodeSelect, onEdgeSelect]);

  // Expose runLayout to parent via cyRef helper
  useEffect(() => {
    if (cyRef && !cyRef.runLayout) {
      cyRef.runLayout = runLayout;
    }
  }, [cyRef, runLayout]);

  // Run layout when elements change
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      // Small timeout to let CytoscapeComponent finish updating its internal elements
      const t = setTimeout(runLayout, 50);
      return () => clearTimeout(t);
    }
  }, [elements, runLayout, cyRef]);

  if (elements.length === 0) return null;

  return (
    <CytoscapeComponent
      elements={elements}
      stylesheet={STYLESHEET}
      cy={handleCyInit}
      style={{ width: '100%', height: '100%' }}
      userZoomingEnabled={true}
      userPanningEnabled={true}
      autoungrabify={false}
      minZoom={0.2}
      maxZoom={4}
    />
  );
}
