import type { GlobalEvent } from "./types.js"

const maxLength = 240

export type ToolContext = { tool?: string; input?: string }

export function renderEvent(event: GlobalEvent, now = new Date(), context?: ToolContext): string | undefined {
  const payload = event.payload
  const prefix = `[${now.toTimeString().slice(0, 8)}]`
  const properties = payload.properties

  if (payload.type === "session.status") {
    const status = properties.status as { type?: unknown; message?: unknown; next?: unknown } | undefined
    const detail = [status?.message, status?.next ? `next=${new Date(Number(status.next)).toLocaleTimeString()}` : undefined].filter(Boolean).join(" ")
    return `${prefix} STATUS  ${stringValue(status?.type)}${detail ? `: ${truncate(detail)}` : ""}`
  }
  if (payload.type === "session.idle") return `${prefix} STATUS  idle`
  if (payload.type === "message.part.updated") return renderPart(properties.part, properties.delta, prefix)
  if (payload.type === "session.next.reasoning.delta") return `${prefix} THINK   ${truncate(stringValue(properties.delta))}`
  if (payload.type === "session.next.shell.started") return `${prefix} TOOL    Shell running: ${truncate(stringValue(properties.command))}`
  if (payload.type === "session.next.tool.called") {
    return `${prefix} TOOL    ${stringValue(properties.tool)} running: ${truncate(toolInput(properties.input))}`
  }
  if (payload.type === "session.next.tool.progress") return toolStatus(prefix, context, "running", toolInput(properties.structured ?? properties.content))
  if (payload.type === "session.next.tool.success") return toolStatus(prefix, context, "completed", toolInput(properties.result ?? properties.structured ?? properties.content))
  if (payload.type === "session.next.tool.failed") return toolStatus(prefix, context, "error", errorText(properties.error))
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
  const value = part as { type?: unknown; text?: unknown; tool?: unknown; state?: { status?: unknown; input?: unknown; title?: unknown; output?: unknown; error?: unknown } } | undefined
  if (value?.type === "reasoning") return `${prefix} THINK   ${truncate(stringValue(delta ?? value.text))}`
  if (value?.type === "tool") {
    const state = value.state
    const details = [state?.input ? `input=${toolInput(state.input)}` : undefined, state?.title, state?.error, state?.output].filter(Boolean).join(" ")
    return `${prefix} TOOL    ${stringValue(value.tool)} ${stringValue(state?.status)}${details ? `: ${truncate(details)}` : ""}`
  }
  if (value?.type === "patch") return `${prefix} EDIT    patch applied`
  return undefined
}

function toolStatus(prefix: string, context: ToolContext | undefined, status: string, detail: string): string {
  const known = [context?.input ? `input=${context.input}` : undefined, detail ? `detail=${detail}` : undefined].filter(Boolean).join(" ")
  return `${prefix} TOOL    ${context?.tool ?? "tool"} ${status}${known ? `: ${truncate(known)}` : ""}`
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

function toolInput(input: unknown): string {
  if (typeof input === "string") return input
  try {
    return JSON.stringify(input)
  } catch {
    return String(input ?? "")
  }
}
