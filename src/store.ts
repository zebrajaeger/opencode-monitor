import { changedFiles } from "./diff.js"
import { eventSessionId } from "./events.js"
import { renderEdit, renderEvent, type ToolContext } from "./render.js"
import { OpenCodeClient, type FileDiff } from "./client.js"
import type { Environment, GlobalEvent, RuntimeActivity, Session, SessionDetail, SessionSummary, TimelineEntry } from "./types.js"

const timelineLimit = 250

export class MonitorStore {
  private sessions = new Map<string, SessionSummary>()
  private environment: Environment = { agents: [], tools: [], mcp: [], lsp: [], formatters: [] }
  private timelines = new Map<string, TimelineEntry[]>()
  private runtime = new Map<string, RuntimeActivity[]>()
  private diffs = new Map<string, FileDiff[]>()
  private toolCalls = new Map<string, ToolContext>()
  private sequence = 0
  private listeners = new Set<(event: StoreEvent) => void>()

  constructor(private readonly client: OpenCodeClient) {}

  async initialize(): Promise<void> {
    const [sessions, statuses, agents, tools, mcp, lsp, formatters] = await Promise.all([
      this.client.sessions(), this.client.statuses(), this.client.agents(), this.client.toolIds(), this.client.mcp(), this.client.lsp(), this.client.formatters(),
    ])
    this.sessions = new Map(sessions.map((session) => [session.id, { ...session, status: statusOf(statuses[session.id]) }]))
    this.environment = { agents, tools, mcp, lsp, formatters }
  }

  snapshot() {
    return { sessions: [...this.sessions.values()], environment: this.environment }
  }

  async detail(id: string): Promise<SessionDetail> {
    const session = this.sessions.get(id)
    if (!session) throw new Error(`OpenCode session "${id}" was not found.`)
    const children = await this.client.children(id)
    const statuses = await this.client.statuses()
    const childSummaries = children.map((child) => ({ ...child, status: statusOf(statuses[child.id]) }))
    return {
      session,
      children: childSummaries,
      timeline: this.timelines.get(id) ?? [],
      runtime: this.runtime.get(id) ?? [],
      diffs: (this.diffs.get(id) ?? []).map(({ file, additions, deletions }) => ({ file, additions, deletions })),
    }
  }

  async watch(id: string): Promise<SessionDetail> {
    await this.refreshDiff(id)
    return this.detail(id)
  }

  subscribe(listener: (event: StoreEvent) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  apply(event: GlobalEvent): void {
    const sessionId = eventSessionId(event.payload)
    if (!sessionId) return
    if (event.payload.type === "session.status") {
      const status = (event.payload.properties.status as { type?: string } | undefined)?.type
      const statusValue = event.payload.properties.status as { type?: string; message?: string; next?: number } | undefined
      const session = this.sessions.get(sessionId)
      if (session && status) {
        session.status = statusOf({ type: status })
        session.statusDetail = statusValue?.message ?? (statusValue?.next ? `next=${new Date(statusValue.next).toLocaleTimeString()}` : undefined)
        this.emit({ type: "session", session })
      }
    }

    const context = this.captureToolContext(sessionId, event)
    const rendered = renderEvent(event, new Date(), context)
    if (rendered) this.addTimeline(sessionId, eventCategory(rendered), rendered.replace(/^\[[^\]]+\]\s+\w+\s+/, ""))
    if (event.payload.type.includes("agent") || event.payload.type.includes("subtask")) {
      const label = String(event.payload.properties.agent ?? event.payload.properties.name ?? event.payload.type)
      const activity = { id: `${event.payload.type}:${label}`, label, status: "observed", observedAt: Date.now() }
      this.runtime.set(sessionId, [activity, ...(this.runtime.get(sessionId) ?? []).filter((item) => item.id !== activity.id)].slice(0, 30))
      this.emit({ type: "runtime", sessionId })
    }
  }

  private captureToolContext(sessionId: string, event: GlobalEvent): ToolContext | undefined {
    const properties = event.payload.properties
    const part = properties.part as { type?: unknown; callID?: unknown; tool?: unknown; state?: { input?: unknown } } | undefined
    const callId = typeof properties.callID === "string" ? properties.callID : typeof part?.callID === "string" ? part.callID : undefined
    if (!callId) return undefined
    const key = `${sessionId}:${callId}`
    const current = this.toolCalls.get(key) ?? {}
    if (event.payload.type === "session.next.tool.called") {
      current.tool = typeof properties.tool === "string" ? properties.tool : current.tool
      current.input = compactInput(properties.input)
    }
    if (event.payload.type === "session.next.shell.started") {
      current.tool = "Shell"
      current.input = typeof properties.command === "string" ? properties.command : current.input
    }
    if (event.payload.type === "message.part.updated") {
      if (part?.type === "tool") {
        current.tool = typeof part.tool === "string" ? part.tool : current.tool
        if (part.state?.input) current.input = compactInput(part.state.input)
      }
    }
    this.toolCalls.set(key, current)
    return current
  }

  async refreshDiff(id: string): Promise<void> {
    if (!this.sessions.has(id)) return
    const current = await this.client.diff(id)
    const previous = this.diffs.get(id) ?? []
    this.diffs.set(id, current)
    for (const diff of changedFiles(previous, current)) this.addTimeline(id, "EDIT", renderEdit(diff.file).replace(/^\[[^\]]+\]\s+EDIT\s+/, ""))
  }

  private addTimeline(sessionId: string, category: TimelineEntry["category"], text: string): void {
    const entry: TimelineEntry = { id: ++this.sequence, at: Date.now(), category, text }
    const entries = [...(this.timelines.get(sessionId) ?? []), entry].slice(-timelineLimit)
    this.timelines.set(sessionId, entries)
    this.emit({ type: "timeline", sessionId, entry })
  }

  private emit(event: StoreEvent): void {
    for (const listener of this.listeners) listener(event)
  }
}

export type StoreEvent =
  | { type: "session"; session: SessionSummary }
  | { type: "timeline"; sessionId: string; entry: TimelineEntry }
  | { type: "runtime"; sessionId: string }

function statusOf(status: { type: string } | undefined): SessionSummary["status"] {
  return status?.type === "idle" || status?.type === "busy" || status?.type === "retry" ? status.type : "unknown"
}

function compactInput(value: unknown): string {
  if (typeof value === "string") return value
  try { return JSON.stringify(value) } catch { return String(value ?? "") }
}

function eventCategory(line: string): TimelineEntry["category"] {
  const match = line.match(/^\[[^\]]+\]\s+(STATUS|THINK|TOOL|EDIT|TODO|PERMISSION|ERROR)/)
  return (match?.[1] as TimelineEntry["category"] | undefined) ?? "AGENT"
}
