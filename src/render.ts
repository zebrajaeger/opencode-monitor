import type { GlobalEvent } from "./types.js"

const maxLength = 240

export function renderEvent(event: GlobalEvent, now = new Date()): string | undefined {
  const payload = event.payload
  const prefix = `[${now.toTimeString().slice(0, 8)}]`
  const properties = payload.properties

  if (payload.type === "session.status") {
    return `${prefix} STATUS  ${stringValue((properties.status as { type?: unknown } | undefined)?.type)}`
  }
  if (payload.type === "session.idle") return `${prefix} STATUS  idle`
  if (payload.type === "message.part.updated") return renderPart(properties.part, properties.delta, prefix)
  if (payload.type === "session.next.reasoning.delta") return `${prefix} THINK   ${truncate(stringValue(properties.delta))}`
  if (payload.type === "session.next.tool.called") return `${prefix} TOOL    ${stringValue(properties.tool)} running`
  if (payload.type === "session.next.tool.progress") return `${prefix} TOOL    ${stringValue(properties.callID)} running`
  if (payload.type === "session.next.tool.success") return `${prefix} TOOL    ${stringValue(properties.callID)} completed`
  if (payload.type === "session.next.tool.failed") return `${prefix} TOOL    ${stringValue(properties.callID)} error: ${truncate(errorText(properties.error))}`
  if (payload.type === "todo.updated") {
    const todos = Array.isArray(properties.todos) ? properties.todos : []
    const complete = todos.filter((todo) => (todo as { status?: unknown }).status === "completed").length
    return `${prefix} TODO    ${complete}/${todos.length} tasks complete`
  }
  if (payload.type === "permission.updated") return `${prefix} PERMISSION  ${truncate(stringValue(properties.title))}`
  if (payload.type === "permission.v2.asked") return `${prefix} PERMISSION  ${truncate(stringValue(properties.action))}`
  if (payload.type === "session.error") return `${prefix} ERROR   ${truncate(errorText(properties.error))}`
  return undefined
}

export function renderEdit(file: string, now = new Date()): string {
  return `[${now.toTimeString().slice(0, 8)}] EDIT    ${file}`
}

function renderPart(part: unknown, delta: unknown, prefix: string): string | undefined {
  const value = part as { type?: unknown; text?: unknown; tool?: unknown; state?: { status?: unknown; title?: unknown; output?: unknown; error?: unknown } } | undefined
  if (value?.type === "reasoning") return `${prefix} THINK   ${truncate(stringValue(delta ?? value.text))}`
  if (value?.type === "tool") {
    const state = value.state
    const detail = state?.title ?? state?.error ?? state?.output
    return `${prefix} TOOL    ${stringValue(value.tool)} ${stringValue(state?.status)}${detail ? `: ${truncate(stringValue(detail))}` : ""}`
  }
  if (value?.type === "patch") return `${prefix} EDIT    patch applied`
  return undefined
}

function errorText(error: unknown): string {
  const value = error as { data?: { message?: unknown } } | undefined
  return stringValue(value?.data?.message ?? error)
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "unknown")
}

function truncate(value: string): string {
  const flattened = value.replace(/\s+/g, " ").trim()
  return flattened.length > maxLength ? `${flattened.slice(0, maxLength - 3)}...` : flattened
}
