export interface RequestLogEntry {
  id: string
  time: string
  query: string
  model: string
  status: "verified" | "review" | "cached"
  cost: number
  latency: number
}

export interface DashboardState {
  requests: RequestLogEntry[]
  totalRequests: number
  costWithout: number
  costWith: number
  kbHits: number
  llmRoutes: number
  cacheHits: number
  kbLatencies: number[]
  llmLatencies: number[]
}

export const initialState: DashboardState = {
  requests: [],
  totalRequests: 0,
  costWithout: 0,
  costWith: 0,
  kbHits: 0,
  llmRoutes: 0,
  cacheHits: 0,
  kbLatencies: [],
  llmLatencies: [],
}

let counter = 0

function getTimeString(): string {
  const now = new Date()
  return now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export type DemoAction =
  | { type: "KB_HIT_PASSWORD" }
  | { type: "KB_HIT_LOGIN" }
  | { type: "KB_HIT_CANCEL" }
  | { type: "LLM_ROUTE_ZAPIER" }
  | { type: "LLM_ROUTE_DISCOUNT" }
  | { type: "IMAGE_CACHE_HIT" }
  | { type: "BULK_50_KB" }
  | { type: "RESET" }

export function dashboardReducer(state: DashboardState, action: DemoAction): DashboardState {
  switch (action.type) {
    case "KB_HIT_PASSWORD": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "How do I reset my password?",
        model: "KB → Llama 3.2 3B",
        status: "verified",
        cost: 0.00003,
        latency: 95,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.0016,
        costWith: state.costWith + 0.00003,
        kbHits: state.kbHits + 1,
        kbLatencies: [...state.kbLatencies, 95],
      }
    }
    case "KB_HIT_LOGIN": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "I forgot my login info, help?",
        model: "KB → Llama 3.2 3B",
        status: "verified",
        cost: 0.00003,
        latency: 102,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.0016,
        costWith: state.costWith + 0.00003,
        kbHits: state.kbHits + 1,
        kbLatencies: [...state.kbLatencies, 102],
      }
    }
    case "KB_HIT_CANCEL": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "How can I cancel my subscription?",
        model: "KB → Llama 3.2 3B",
        status: "verified",
        cost: 0.00003,
        latency: 88,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.0016,
        costWith: state.costWith + 0.00003,
        kbHits: state.kbHits + 1,
        kbLatencies: [...state.kbLatencies, 88],
      }
    }
    case "LLM_ROUTE_ZAPIER": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "Do you integrate with Zapier?",
        model: "GPT-4.1 Mini",
        status: "review",
        cost: 0.0016,
        latency: 820,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.0016,
        costWith: state.costWith + 0.0016,
        llmRoutes: state.llmRoutes + 1,
        llmLatencies: [...state.llmLatencies, 820],
      }
    }
    case "LLM_ROUTE_DISCOUNT": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "Can I get a bulk discount for my team?",
        model: "GPT-4.1 Mini",
        status: "review",
        cost: 0.0018,
        latency: 910,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.0018,
        costWith: state.costWith + 0.0018,
        llmRoutes: state.llmRoutes + 1,
        llmLatencies: [...state.llmLatencies, 910],
      }
    }
    case "IMAGE_CACHE_HIT": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "Sunset over futuristic city",
        model: "Cache (Image)",
        status: "cached",
        cost: 0,
        latency: 12,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 1,
        costWithout: state.costWithout + 0.04,
        costWith: state.costWith + 0,
        cacheHits: state.cacheHits + 1,
      }
    }
    case "BULK_50_KB": {
      const entry: RequestLogEntry = {
        id: `req-${++counter}`,
        time: getTimeString(),
        query: "Batch: 50 verified queries",
        model: "KB → Llama 3.2 3B",
        status: "verified",
        cost: 0.0015,
        latency: 97,
      }
      return {
        ...state,
        requests: [entry, ...state.requests],
        totalRequests: state.totalRequests + 50,
        costWithout: state.costWithout + 0.08,
        costWith: state.costWith + 0.0015,
        kbHits: state.kbHits + 50,
        kbLatencies: [...state.kbLatencies, 97],
      }
    }
    case "RESET": {
      counter = 0
      return { ...initialState }
    }
    default:
      return state
  }
}
