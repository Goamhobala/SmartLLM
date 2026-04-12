/**
 * Module-level KB store — single source of truth for the knowledge graph.
 * Lives at module scope so both the dashboard and KB pages share the same instance
 * within a session, with no database or localStorage required.
 */

import { useSyncExternalStore } from "react"
import { PAYFLOW_NODES, PAYFLOW_EDGES, type KBNode, type KBEdge } from "./kb-graph-data"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RagDomain {
  id: string
  url: string
  description: string
  addedAt: string
}

interface KBState {
  nodes: KBNode[]
  edges: KBEdge[]
  ragDomains: RagDomain[]
}

// ─── Module-level state ───────────────────────────────────────────────────────

let state: KBState = {
  nodes: [...PAYFLOW_NODES],
  edges: [...PAYFLOW_EDGES],
  ragDomains: [
    {
      id: "domain-1",
      url: "developers.payflow.co.za",
      description: "REST API reference, webhook guides, SDK samples, and integration tutorials.",
      addedAt: "2026-03-01",
    },
    {
      id: "domain-2",
      url: "help.payflow.co.za",
      description: "Customer-facing help centre articles and troubleshooting guides.",
      addedAt: "2026-03-15",
    },
  ],
}

const listeners = new Set<() => void>()

function notify() {
  listeners.forEach(l => l())
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Add a pending KB entry discovered by the RAG tier. */
export function addPendingKBEntry(node: KBNode): void {
  // Deduplicate by id — dashboard buttons can fire multiple times
  if (state.nodes.some(n => n.id === node.id)) return
  const edge: KBEdge = {
    id: `h-rag-${node.id}`,
    source: node.category,
    target: node.id,
    type: "hierarchy",
  }
  state = {
    ...state,
    nodes: [...state.nodes, node],
    edges: [...state.edges, edge],
  }
  notify()
}

/** Add a domain to the RAG whitelist. */
export function addRagDomain(url: string, description: string): void {
  if (state.ragDomains.some(d => d.url === url)) return
  const domain: RagDomain = {
    id: `domain-${Date.now()}`,
    url,
    description,
    addedAt: new Date().toISOString().split("T")[0],
  }
  state = { ...state, ragDomains: [...state.ragDomains, domain] }
  notify()
}

/** Remove a domain from the RAG whitelist. */
export function removeRagDomain(id: string): void {
  state = { ...state, ragDomains: state.ragDomains.filter(d => d.id !== id) }
  notify()
}

/** Update nodes/edges from within the KB page (add node, delete, save). */
export function setKBState(nodes: KBNode[], edges: KBEdge[]): void {
  state = { ...state, nodes, edges }
  notify()
}

// ─── React hook ───────────────────────────────────────────────────────────────

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): KBState {
  return state
}

export function useKBStore(): KBState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
