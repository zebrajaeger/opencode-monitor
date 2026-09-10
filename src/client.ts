import type { GlobalEvent, Session, SessionStatus } from "./types.js"

export type FileDiff = {
  file: string
  before: string
  after: string
  additions: number
  deletions: number
}

export class OpenCodeClient {
  constructor(private readonly baseUrl: string, private readonly request: typeof fetch = fetch) {}

  async health(): Promise<void> {
    let response: Response
    try {
      response = await this.request(`${this.baseUrl}/global/health`)
    } catch (error) {
      throw new Error(`Cannot reach OpenCode at ${this.baseUrl}: ${message(error)}`)
    }

    if (!response.ok) {
      throw new Error(`OpenCode at ${this.baseUrl} returned HTTP ${response.status}. Start it with: opencode --port 4096`)
    }

    const body = (await response.json()) as { healthy?: boolean }
    if (!body.healthy) {
      throw new Error(`OpenCode at ${this.baseUrl} is not healthy.`)
    }
  }

  async sessions(): Promise<Session[]> {
    return this.getJson<Session[]>("/session")
  }

  async statuses(): Promise<Record<string, { type: string }>> {
    return this.getJson<Record<string, { type: string }>>("/session/status")
  }

  async session(id: string): Promise<Session> {
    return this.getJson<Session>(`/session/${encodeURIComponent(id)}`)
  }

  async diff(id: string): Promise<FileDiff[]> {
    return this.getJson<FileDiff[]>(`/session/${encodeURIComponent(id)}/diff`)
  }

  async agents(): Promise<Array<{ name?: string; id?: string; [key: string]: unknown }>> {
    return this.getJson("/agent")
  }

  async toolIds(): Promise<string[]> {
    return this.getJson("/experimental/tool/ids")
  }

  async mcp(): Promise<Array<{ name?: string; status?: string; [key: string]: unknown }>> {
    return this.getJson("/mcp")
  }

  async lsp(): Promise<Array<{ name?: string; status?: string; [key: string]: unknown }>> {
    return this.getJson("/lsp")
  }

  async formatters(): Promise<Array<{ name?: string; [key: string]: unknown }>> {
    return this.getJson("/formatter")
  }

  async children(id: string): Promise<Session[]> {
    return this.getJson<Session[]>(`/session/${encodeURIComponent(id)}/children`)
  }

  async *events(signal?: AbortSignal): AsyncGenerator<GlobalEvent> {
    let response: Response
    try {
      response = await this.request(`${this.baseUrl}/event`, {
        headers: { Accept: "text/event-stream" },
        signal,
      })
    } catch (error) {
      throw new Error(`Event stream at ${this.baseUrl} disconnected: ${message(error)}`)
    }
    if (!response.ok || !response.body) {
      throw new Error(`Event stream at ${this.baseUrl} returned HTTP ${response.status}.`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let pending = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) return
        pending += decoder.decode(value, { stream: true })
        const messages = pending.split(/\r?\n\r?\n/)
        pending = messages.pop() ?? ""
        for (const event of messages) {
          const data = event
            .split(/\r?\n/)
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n")
          if (data) yield normalizeEvent(JSON.parse(data))
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  private async getJson<T>(path: string): Promise<T> {
    const response = await this.request(`${this.baseUrl}${path}`)
    if (!response.ok) {
      throw new Error(`OpenCode request ${path} returned HTTP ${response.status}.`)
    }
    return response.json() as Promise<T>
  }
}

function normalizeEvent(value: unknown): GlobalEvent {
  const event = value as { directory?: unknown; payload?: unknown; type?: unknown; properties?: unknown }
  if (event.payload && typeof event.payload === "object") {
    return {
      directory: typeof event.directory === "string" ? event.directory : undefined,
      payload: event.payload as GlobalEvent["payload"],
    }
  }
  return {
    payload: {
      type: typeof event.type === "string" ? event.type : "unknown",
      properties: isRecord(event.properties) ? event.properties : {},
    },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function sessionStatus(status: { type: string } | undefined): SessionStatus {
  if (status?.type === "idle" || status?.type === "busy" || status?.type === "retry") return status.type
  return "unknown"
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
