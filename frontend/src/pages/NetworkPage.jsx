/**
 * NetworkPage — interactive investigation network visualization.
 *
 * DATA FLOW:
 *   FastAPI → GET /api/cases → case selector
 *   FastAPI → GET /api/cases/{case_id}/graph → Cytoscape.js elements
 *
 * DATA INTEGRITY:
 * - All nodes and edges come exclusively from the backend API
 * - No nodes, edges, relationships, or demo paths are hardcoded here
 * - Confidence, priority, analytics are NOT calculated in React
 * - Safety messaging is always visible
 *
 * SAFETY:
 * - "SYNTHETIC DEMONSTRATION DATA" banner (in AppLayout SafetyBanner)
 * - "Analytical lead only. Requires human verification." in entity details
 * - Neutral terminology throughout: "Potential Relationship", "Analytical Lead"
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Network, Search, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../api/client';
import GraphViewer from '../components/network/GraphViewer';
import EntityDetails from '../components/network/EntityDetails';
import GraphLegend from '../components/network/GraphLegend';
import GraphControls from '../components/network/GraphControls';

// Convert API response (nodes/edges arrays) to Cytoscape elements format
function buildCytoscapeElements(graphData) {
  if (!graphData) return [];
  const elements = [];

  (graphData.nodes || []).forEach((node) => {
    elements.push({
      data: {
        id: node.id,
        label: node.label || node.id,
        type: node.type || 'UNKNOWN',
      },
    });
  });

  (graphData.edges || []).forEach((edge) => {
    elements.push({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        relationship_type: edge.relationship_type || '',
        confidence: edge.confidence ?? 0,
        evidence: edge.evidence || '',
        case_id: edge.case_id || '',
        detection_method: edge.detection_method || '',
      },
    });
  });

  return elements;
}

export default function NetworkPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCaseId = searchParams.get('caseId') || searchParams.get('case');

  // Case inventory state
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(true);
  const [casesError, setCasesError] = useState(null);

  // Selected case and its graph
  const [selectedCaseId, setSelectedCaseId] = useState(paramCaseId || '');
  const [graphData, setGraphData] = useState(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState(null);

  // Selected graph element
  const [selected, setSelected] = useState(null);

  // Local search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Ref to the Cytoscape core instance (set by GraphViewer)
  const cyRef = useRef(null);

  // ── Load case inventory ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setCasesLoading(true);
        const res = await api.get('/api/cases');
        setCases(res.data);
        setCasesError(null);
        
        // Auto-select requested case or first available
        if (paramCaseId && res.data.some((c) => c.id === paramCaseId)) {
          setSelectedCaseId(paramCaseId);
        } else if (!selectedCaseId && res.data.length > 0) {
          setSelectedCaseId(res.data[0].id);
        }
      } catch (err) {
        setCasesError('Unable to load cases from API.');
      } finally {
        setCasesLoading(false);
      }
    };
    load();
  }, [paramCaseId]);

  // Sync with search parameter changes
  useEffect(() => {
    if (paramCaseId && cases.some((c) => c.id === paramCaseId)) {
      setSelectedCaseId(paramCaseId);
    }
  }, [paramCaseId, cases]);

  // ── Load graph for selected case ─────────────────────────────────────────
  useEffect(() => {
    if (!selectedCaseId) return;

    const load = async () => {
      try {
        setGraphLoading(true);
        setGraphError(null);
        setSelected(null);
        const res = await api.get(`/api/cases/${selectedCaseId}/graph`);
        setGraphData(res.data);
      } catch (err) {
        setGraphError('Unable to load graph from API. Please ensure the backend is running.');
        setGraphData(null);
      } finally {
        setGraphLoading(false);
      }
    };
    load();
  }, [selectedCaseId]);

  // ── Compute Cytoscape elements (filtered by local search) ────────────────
  const allElements = buildCytoscapeElements(graphData);

  const filteredElements = searchQuery.trim()
    ? (() => {
        const q = searchQuery.toLowerCase();
        // Find matching node IDs
        const matchingNodeIds = new Set(
          allElements
            .filter(
              (el) =>
                !el.data.source && // is a node
                (el.data.id?.toLowerCase().includes(q) ||
                  el.data.label?.toLowerCase().includes(q) ||
                  el.data.type?.toLowerCase().includes(q))
            )
            .map((el) => el.data.id)
        );
        // Include matched nodes + edges connecting them
        return allElements.filter(
          (el) =>
            (!el.data.source && matchingNodeIds.has(el.data.id)) ||
            (el.data.source &&
              matchingNodeIds.has(el.data.source) &&
              matchingNodeIds.has(el.data.target))
        );
      })()
    : allElements;

  const hasRelationships = graphData && (graphData.edges?.length ?? 0) > 0;
  const isEmptyCase = graphData && !hasRelationships;

  const handleResetLayout = useCallback(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.layout({
      name: 'cose',
      animate: false,
      randomize: true,
      componentSpacing: 80,
      nodeRepulsion: () => 8000,
      nodeOverlap: 20,
      idealEdgeLength: () => 100,
      edgeElasticity: () => 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
    }).run();
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Page header */}
      <div className="px-6 pt-5 pb-4 bg-white border-b border-slate-200">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Network size={20} className="text-indigo-600" />
              <h1 className="text-xl font-bold text-slate-900">Network Investigation</h1>
            </div>
            <p className="text-sm text-slate-500">
              Interactive graph of validated entity relationships from the intelligence pipeline.
            </p>
          </div>

          {/* Case selector + search */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Case dropdown */}
            <div className="flex flex-col">
              <label htmlFor="case-selector" className="text-xs font-medium text-slate-500 mb-1">
                Select Case
              </label>
              {casesLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 w-52">
                  <Loader2 size={14} className="animate-spin" /> Loading cases…
                </div>
              ) : casesError ? (
                <div className="flex items-center gap-2 text-sm text-red-600 px-3 py-2 border border-red-200 rounded-lg bg-red-50 w-52">
                  <AlertTriangle size={14} /> {casesError}
                </div>
              ) : (
                <select
                  id="case-selector"
                  value={selectedCaseId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedCaseId(newId);
                    setSearchParams({ caseId: newId });
                    setSearchQuery('');
                  }}
                  className="w-56 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
                >
                  {cases.map((c) => {
                    const title = c.details?.title || c.details?.case_title;
                    const truncatedTitle = title && title.length > 28 ? `${title.slice(0, 28)}…` : title;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.id}{truncatedTitle ? ` — ${truncatedTitle}` : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Local graph search */}
            <div className="flex flex-col">
              <label htmlFor="graph-search" className="text-xs font-medium text-slate-500 mb-1">
                Search Nodes
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  id="graph-search"
                  type="text"
                  placeholder="Filter graph nodes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content: graph + sidebar */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Graph area */}
        <div className="flex-1 flex flex-col relative bg-slate-100 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Loading overlay */}
          {graphLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 bg-opacity-90">
              <Loader2 size={36} className="animate-spin text-indigo-500 mb-3" />
              <p className="text-sm text-slate-600 font-medium">Loading investigation graph…</p>
              <p className="text-xs text-slate-400 mt-1">Fetching from backend API</p>
            </div>
          )}

          {/* API Error state */}
          {graphError && !graphLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 p-8">
              <AlertTriangle size={40} className="text-red-400 mb-3" />
              <p className="text-base font-semibold text-red-700 mb-1">API Connection Error</p>
              <p className="text-sm text-slate-600 text-center max-w-sm">{graphError}</p>
            </div>
          )}

          {/* Empty case state */}
          {isEmptyCase && !graphLoading && !graphError && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 p-8">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <Network size={28} className="text-slate-400" />
              </div>
              <p className="text-base font-semibold text-slate-700 mb-2">No Validated Relationships</p>
              <p className="text-sm text-slate-500 text-center max-w-md">
                No validated network relationships are available for this case.
                The graph has been constructed from communication and transaction evidence; this case
                currently has no extracted entity connections.
              </p>
              <p className="mt-4 text-xs text-amber-600 font-medium bg-amber-50 border border-amber-200 rounded px-3 py-2">
                Absence of relationships does not indicate absence of activity.
              </p>
            </div>
          )}

          {/* Cytoscape graph canvas */}
          {!graphLoading && !graphError && filteredElements.length > 0 && (
            <div className="flex-1" style={{ minHeight: 0, height: '100%' }}>
              <GraphViewer
                elements={filteredElements}
                cyRef={cyRef}
                onNodeSelect={(sel) => setSelected(sel)}
                onEdgeSelect={(sel) => setSelected(sel)}
              />
            </div>
          )}

          {/* Search returned nothing */}
          {!graphLoading && !graphError && !isEmptyCase && searchQuery && filteredElements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
              <Search size={32} className="text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No nodes matched "{searchQuery}".</p>
            </div>
          )}
        </div>

        {/* Details sidebar */}
        <div className="w-72 border-l border-slate-200 bg-white flex flex-col overflow-hidden">
          <EntityDetails
            selected={selected}
            onClose={() => {
              setSelected(null);
              cyRef.current?.$(':selected').unselect();
            }}
          />
        </div>
      </div>

      {/* Controls bar */}
      <GraphControls cyRef={cyRef} onResetLayout={handleResetLayout} />

      {/* Legend bar */}
      <GraphLegend />
    </div>
  );
}
