import { describe, expect, it } from "vitest"
import { belongsToSession } from "../src/events.js"
import { renderEdit, renderEvent } from "../src/render.js"
import type { GlobalEvent } from "../src/types.js"

const now = new Date("2026-09-10T10:20:30Z")
const time = now.toTimeString().slice(0, 8)

describe("event monitoring", () => {
  it("filters message parts by session", () => {
    const event: GlobalEvent = {
      payload: { type: "message.part.updated", properties: { part: { sessionID: "one", type: "reasoning", text: "checking" } } },
    }
    expect(belongsToSession(event, "one")).toBe(true)
    expect(belongsToSession(event, "two")).toBe(false)
  })

  it("filters direct session events", () => {
    const event: GlobalEvent = { payload: { type: "session.idle", properties: { sessionID: "one" } } }
    expect(belongsToSession(event, "one")).toBe(true)
  })

  it("renders reasoning, tools, todos, permissions, and errors", () => {
    const events: GlobalEvent[] = [
      { payload: { type: "message.part.updated", properties: { part: { type: "reasoning", text: "checking code" } } } },
      { payload: { type: "message.part.updated", properties: { part: { type: "tool", tool: "grep", state: { status: "running", title: "Searching" } } } } },
      { payload: { type: "todo.updated", properties: { todos: [{ status: "completed" }, { status: "pending" }] } } },
      { payload: { type: "permission.updated", properties: { title: "Allow bash" } } },
      { payload: { type: "session.error", properties: { error: { data: { message: "failed" } } } } },
    ]
    expect(events.map((event) => renderEvent(event, now))).toEqual([
      `[${time}] THINK   checking code`,
      `[${time}] TOOL    grep running: Searching`,
      `[${time}] TODO    1/2 tasks complete`,
      `[${time}] PERMISSION  Allow bash`,
      `[${time}] ERROR   failed`,
    ])
    expect(renderEdit("src/cli.ts", now)).toBe(`[${time}] EDIT    src/cli.ts`)
  })

  it("renders current OpenCode reasoning and tool events", () => {
    const event: GlobalEvent = {
      payload: { type: "session.next.reasoning.delta", properties: { sessionID: "one", delta: "checking current API" } },
    }
    expect(renderEvent(event, now)).toBe(`[${time}] THINK   checking current API`)
  })

  it("renders shell commands and structured tool inputs", () => {
    const shell: GlobalEvent = {
      payload: { type: "session.next.shell.started", properties: { sessionID: "one", command: "openspec list --json" } },
    }
    const tool: GlobalEvent = {
      payload: { type: "session.next.tool.called", properties: { sessionID: "one", tool: "bash", input: { command: "npm test" } } },
    }
    expect(renderEvent(shell, now)).toBe(`[${time}] TOOL    Shell running: openspec list --json`)
    expect(renderEvent(tool, now)).toBe(`[${time}] TOOL    bash running: {"command":"npm test"}`)
  })

  it("truncates long tool input", () => {
    const event: GlobalEvent = {
      payload: { type: "session.next.shell.started", properties: { sessionID: "one", command: "x".repeat(300) } },
    }
    expect(renderEvent(event, now)).toContain("...")
  })

  it("renders retry status details", () => {
    const event: GlobalEvent = {
      payload: { type: "session.status", properties: { sessionID: "one", status: { type: "retry", message: "rate limited", next: 0 } } },
    }
    expect(renderEvent(event, now)).toContain("rate limited")
  })
})
