import type { GlobalEvent, OpenCodeEvent } from "./types.js"

export function belongsToSession(event: GlobalEvent, sessionId: string): boolean {
  return eventSessionId(event.payload) === sessionId
}

export function eventSessionId(event: OpenCodeEvent): string | undefined {
  const properties = event.properties
  if (typeof properties.sessionID === "string") return properties.sessionID
  if (event.type === "message.part.updated") {
    const part = properties.part as { sessionID?: unknown } | undefined
    return typeof part?.sessionID === "string" ? part.sessionID : undefined
  }
  if (event.type === "message.updated") {
    const info = properties.info as { sessionID?: unknown } | undefined
    return typeof info?.sessionID === "string" ? info.sessionID : undefined
  }
  return undefined
}
