export type SessionStatus = "idle" | "busy" | "retry" | "unknown"

export type Session = {
  id: string
  title: string
  time?: { updated?: number }
}

export type SessionSummary = Session & {
  status: SessionStatus
  statusDetail?: string
}

export type Environment = {
  agents: Array<{ name?: string; id?: string; [key: string]: unknown }>
  tools: string[]
  mcp: Array<{ name?: string; status?: string; [key: string]: unknown }>
  lsp: Array<{ name?: string; status?: string; [key: string]: unknown }>
  formatters: Array<{ name?: string; [key: string]: unknown }>
}

export type TimelineEntry = {
  id: number
  at: number
  category: "STATUS" | "THINK" | "TOOL" | "EDIT" | "TODO" | "PERMISSION" | "ERROR" | "AGENT"
  text: string
}

export type RuntimeActivity = {
  id: string
  label: string
  status: string
  observedAt: number
}

export type SessionDetail = {
  session: SessionSummary
  children: SessionSummary[]
  timeline: TimelineEntry[]
  runtime: RuntimeActivity[]
  diffs: Array<{ file: string; additions: number; deletions: number }>
}

export type OpenCodeEvent = {
  type: string
  properties: Record<string, unknown>
}

export type GlobalEvent = {
  directory?: string
  payload: OpenCodeEvent
}
