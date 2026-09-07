/**
 * GraphViewer — Cytoscape.js canvas for investigation network visualization.
 *
 * DATA INTEGRITY:
 * - Only renders data returned by GET /api/cases/{case_id}/graph
 * - Does NOT create, infer, or calculate any nodes/edges/relationships
 * - Does NOT calculate confidence, priority, or analytics in the client
 * - Only visualizes what the backend pipeline validates
 */
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useTheme } from '../../context/ThemeContext';

// Visual hierarchy & distinct iconography shapes
const TYPE_STYLES = {
  CASE:         { color: '#818cf8', shape: 'hexagon',         size: 64, zIndex: 10 }, // indigo-400
  PERSON:       { color: '#38bdf8', shape: 'ellipse',         size: 52, zIndex: 9  }, // sky-400
  PHONE:        { color: '#34d399', shape: 'triangle',        size: 42, zIndex: 6  }, // emerald-400
  BANK_ACCOUNT: { color: '#fbbf24', shape: 'diamond',         size: 44, zIndex: 6  }, // amber-400
  VEHICLE:      { color: '#c084fc', shape: 'round-rectangle', size: 42, zIndex: 5  }, // purple-400
  LOCATION:     { color: '#f87171', shape: 'vee',             size: 42, zIndex: 5  }, // red-400
  ORGANIZATION: { color: '#f472b6', shape: 'star',            size: 48, zIndex: 7  }, // pink-400
  UNKNOWN:      { color: '#94a3b8', shape: 'ellipse',         size: 38, zIndex: 1  },
};

function getTypeStyle(type) {
  return TYPE_STYLES[type] || TYPE_STYLES.UNKNOWN;
}

// Dynamic investigation stylesheet with theme-aware text halos and edges
function getGraphStylesheet(isDark) {
  return [
    {
      selector: 'node',
      style: {
        'background-color': (ele) => getTypeStyle(ele.data('type')).color,
        'shape': (ele) => getTypeStyle(ele.data('type')).shape,
        'width': (ele) => getTypeStyle(ele.data('type')).size,
        'height': (ele) => getTypeStyle(ele.data('type')).size,
        'label': 'data(label)',
        'font-size': '10px',
        'font-weight': '600',
        'color': isDark ? '#f8fafc' : '#0f172a',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 5,
        'text-max-width': '95px',
        'text-wrap': 'ellipsis',
        'text-outline-color': isDark ? '#0b0f19' : '#ffffff',
        'text-outline-width': 2.5,
        'border-width': 2,
        'border-color': isDark ? '#1e293b' : '#cbd5e1',
        'border-opacity': 0.9,
        'background-opacity': 0.95,
        'z-index': (ele) => getTypeStyle(ele.data('type')).zIndex,
        'transition-property': 'border-width, border-color, background-opacity, opacity',
        'transition-duration': '180ms',
      },
    },
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': '#38bdf8',
        'background-opacity': 1,
        'z-index': 999,
        'shadow-blur': 12,
        'shadow-color': isDark ? '#38bdf8' : '#0284c7',
        'shadow-opacity': 0.8,
      },
    },
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 3,
        'border-color': '#60a5fa',
        'opacity': 1,
        'z-index': 990,
      },
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': isDark ? '#475569' : '#94a3b8',
        'target-arrow-color': isDark ? '#475569' : '#94a3b8',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.1,
        'curve-style': 'bezier',
        'label': 'data(relationship_type)',
        'font-size': '9px',
        'font-weight': '500',
        'color': isDark ? '#94a3b8' : '#475569',
        'text-rotation': 'autorotate',
        'text-margin-y': -7,
        'text-background-color': isDark ? '#090d16' : '#ffffff',
        'text-background-opacity': 0.92,
        'text-background-padding': '3px',
        'text-background-shape': 'round-rectangle',
        'opacity': 0.85,
        'transition-property': 'line-color, target-arrow-color, opacity, width',
        'transition-duration': '180ms',
      },
    },
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#38bdf8',
        'target-arrow-color': '#38bdf8',
        'width': 3.5,
        'opacity': 1,
        'z-index': 999,
        'color': isDark ? '#f8fafc' : '#0284c7',
      },
    },
    {
      selector: 'edge.highlighted',
      style: {
        'line-color': '#60a5fa',
        'target-arrow-color': '#60a5fa',
        'width': 2.5,
        'opacity': 0.95,
        'z-index': 990,
      },
    },
    {
      selector: '.dimmed',
      style: {
        'opacity': 0.15,
        'text-opacity': 0.1,
      },
    },
  ];
}

const LAYOUT_CONFIG = {
  name: 'cose',
  animate: false,
  randomize: false,
  componentSpacing: 100,
  nodeRepulsion: () => 14000,
  nodeOverlap: 40,
  idealEdgeLength: () => 120,
  edgeElasticity: () => 80,
  nestingFactor: 5,
  gravity: 50,
  numIter: 1000,
  initialTemp: 200,
  coolingFactor: 0.95,
  minTemp: 1.0,
};

export default function GraphViewer({ 
  elements, 
  onNodeSelect, 
  onEdgeSelect, 
  onNodeNavigate,
  cyRef 
}) {
  const { isDark } = useTheme();
  const stylesheet = useMemo(() => getGraphStylesheet(isDark), [isDark]);
  const layoutRef = useRef(null);

  // Update Cytoscape instance styles when theme changes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style(stylesheet);
    }
  }, [stylesheet, cyRef]);

  // Run layout and fit view
  const runLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy || cy.elements().length === 0) return;
    if (layoutRef.current) {
      try { layoutRef.current.stop(); } catch (_) {}
    }
    layoutRef.current = cy.layout(LAYOUT_CONFIG);
    layoutRef.current.run();
    cy.fit(undefined, 30);
  }, [cyRef]);

  // Attach event listeners
  const handleCyInit = useCallback((cy) => {
    cyRef.current = cy;

    // Node click/tap -> select and highlight neighborhood
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      cy.elements().removeClass('dimmed highlighted');
      cy.$(':selected').unselect();
      node.select();

      // Highlight immediate neighbors
      const neighborhood = node.neighborhood();
      const nonNeighbors = cy.elements().not(node).not(neighborhood);
      nonNeighbors.addClass('dimmed');
      neighborhood.addClass('highlighted');

      onNodeSelect?.({ elementType: 'node', data: node.data() });
    });

    // Node double click/tap -> direct navigation
    let lastTap = 0;
    cy.on('tap', 'node', (evt) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        // Double-tap detected
        const node = evt.target;
        onNodeNavigate?.(node.data());
      }
      lastTap = now;
    });

    // Edge tap -> select and highlight
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      cy.elements().removeClass('dimmed highlighted');
      cy.$(':selected').unselect();
      edge.select();

      const connectedNodes = edge.connectedNodes();
      cy.elements().not(edge).not(connectedNodes).addClass('dimmed');
      connectedNodes.addClass('highlighted');

      onEdgeSelect?.({ elementType: 'edge', data: edge.data() });
    });

    // Background tap -> deselect all and restore visibility
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('dimmed highlighted');
        cy.$(':selected').unselect();
        onNodeSelect?.(null);
        onEdgeSelect?.(null);
      }
    });
  }, [cyRef, onNodeSelect, onEdgeSelect, onNodeNavigate]);

  // Expose runLayout to parent via cyRef helper
  useEffect(() => {
    if (cyRef) {
      cyRef.runLayout = runLayout;
    }
  }, [cyRef, runLayout]);

  // Run layout when elements change
  useEffect(() => {
    if (cyRef.current && elements.length > 0) {
      const t = setTimeout(runLayout, 60);
      return () => clearTimeout(t);
    }
  }, [elements, runLayout, cyRef]);

  if (elements.length === 0) return null;

  return (
    <div className="w-full h-full relative">
      <CytoscapeComponent
        elements={elements}
        stylesheet={stylesheet}
        cy={handleCyInit}
        style={{ width: '100%', height: '100%', backgroundColor: isDark ? '#090d16' : '#f8fafc' }}
        userZoomingEnabled={true}
        userPanningEnabled={true}
        autoungrabify={false}
        minZoom={0.15}
        maxZoom={4}
      />
    </div>
  );
}
