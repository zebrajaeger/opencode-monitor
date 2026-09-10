import { afterEach, describe, expect, it } from "vitest"
import type { Server } from "node:http"
import { OpenCodeClient } from "../src/client.js"
import { startDashboard } from "../src/server.js"
import { MonitorStore } from "../src/store.js"

const servers: Server[] = []

afterEach(() => {
  for (const server of servers) server.close()
  servers.length = 0
})

function dashboard() {
  const client = new OpenCodeClient("http://opencode.test", async (input) => {
    const url = String(input)
    if (url.endsWith("/session")) return new Response('[{"id":"one","title":"First"}]')
    if (url.endsWith("/session/status")) return new Response('{"one":{"type":"busy"}}')
    if (url.endsWith("/agent")) return new Response('[{"name":"build"}]')
    if (url.endsWith("/experimental/tool/ids")) return new Response('["bash"]')
    if (url.endsWith("/session/one/children")) return new Response("[]")
    if (url.endsWith("/session/one/diff")) return new Response("[]")
    return new Response("[]")
  })
  return new MonitorStore(client)
}

describe("dashboard server", () => {
  it("binds only to loopback and serves snapshot and session details", async () => {
    const store = dashboard()
    await store.initialize()
    const dashboardServer = await startDashboard(store)
    servers.push(dashboardServer.server)
    expect(dashboardServer.url).toMatch(/^http:\/\/127\.0\.0\.1:/)
    const page = await fetch(dashboardServer.url).then((response) => response.text())
    expect(page).toContain("@media(max-width:850px)")
    expect(page).toContain("Observed runtime activity")
    const snapshot = await fetch(`${dashboardServer.url}/api/snapshot`).then((response) => response.json())
    expect(snapshot.sessions[0]).toMatchObject({ id: "one", status: "busy" })
    const detail = await fetch(`${dashboardServer.url}/api/sessions/one`).then((response) => response.json())
    expect(detail.session.title).toBe("First")
    expect(await fetch(`${dashboardServer.url}/missing`, { method: "POST" })).toMatchObject({ status: 405 })
  })

  it("streams store updates to browser SSE clients", async () => {
    const store = dashboard()
    await store.initialize()
    const dashboardServer = await startDashboard(store)
    servers.push(dashboardServer.server)
    const response = await fetch(`${dashboardServer.url}/api/events`)
    const reader = response.body?.getReader()
    expect(reader).toBeDefined()
    await reader!.read()
    store.apply({ payload: { type: "session.next.reasoning.delta", properties: { sessionID: "one", delta: "checking" } } })
    const result = await reader!.read()
    expect(new TextDecoder().decode(result.value)).toContain("timeline")
    await reader!.cancel()
  })
})
