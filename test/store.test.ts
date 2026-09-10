import { describe, expect, it } from "vitest"
import { MonitorStore } from "../src/store.js"

function client() {
  return {
    sessions: async () => [{ id: "one", title: "First" }],
    statuses: async () => ({ one: { type: "idle" } }),
    agents: async () => [{ name: "build" }],
    toolIds: async () => ["bash"],
    mcp: async () => [{ name: "gitnexus", status: "connected" }],
    lsp: async () => [],
    formatters: async () => [],
    children: async () => [{ id: "child", title: "Child" }],
    diff: async () => [{ file: "src/a.ts", before: "", after: "new", additions: 1, deletions: 0 }],
  }
}

describe("MonitorStore", () => {
  it("keeps a session snapshot and adds matching timeline events", async () => {
    const store = new MonitorStore(client() as never)
    await store.initialize()
    expect(store.snapshot().sessions).toEqual([{ id: "one", title: "First", status: "idle" }])
    store.apply({ payload: { type: "session.next.reasoning.delta", properties: { sessionID: "one", delta: "checking" } } })
    expect((await store.detail("one")).timeline[0]).toMatchObject({ category: "THINK", text: "checking" })
  })

  it("records diff-based edits only for known sessions", async () => {
    const store = new MonitorStore(client() as never)
    await store.initialize()
    await store.refreshDiff("one")
    expect((await store.detail("one")).timeline[0]).toMatchObject({ category: "EDIT", text: "src/a.ts" })
  })
})
