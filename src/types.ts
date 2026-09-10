export type SessionStatus = "idle" | "busy" | "retry" | "unknown"

export type Session = {
  id: string
  title: string
  time?: { updated?: number }
}

export type SessionSummary = Session & {
  status: SessionStatus
}

export type OpenCodeEvent = {
  type: string
  properties: Record<string, unknown>
}

export type GlobalEvent = {
  directory?: string
  payload: OpenCodeEvent
}
