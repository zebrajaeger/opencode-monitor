import { describe, expect, it } from "vitest"
import { OpenCodeClient } from "../src/client.js"

describe("OpenCodeClient", () => {
  it("accepts a healthy server", async () => {
    const client = new OpenCodeClient("http://server.test", async () => new Response(JSON.stringify({ healthy: true })))
    await expect(client.health()).resolves.toBeUndefined()
  })

  it("reports an unreachable server", async () => {
    const client = new OpenCodeClient("http://server.test", async () => {
      throw new Error("connection refused")
    })
    await expect(client.health()).rejects.toThrow("Cannot reach OpenCode")
  })

  it("reports an unhealthy response", async () => {
    const client = new OpenCodeClient("http://server.test", async () => new Response("no", { status: 503 }))
    await expect(client.health()).rejects.toThrow("HTTP 503")
  })

  it("parses raw OpenCode SSE events", async () => {
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('data: {"type":"session.idle","properties":{"sessionID":"one"}}\n\n'))
        controller.close()
      },
    })
    const client = new OpenCodeClient("http://server.test", async () => new Response(stream))
    const events = []
    for await (const event of client.events()) events.push(event)
    expect(events).toEqual([{ payload: { type: "session.idle", properties: { sessionID: "one" } } }])
  })

  it("uses only read-only HTTP requests", async () => {
    const requests: Array<{ url: string; method: string }> = []
    const client = new OpenCodeClient("http://server.test", async (input, init) => {
      const url = typeof input === "string" ? input : input.url
      requests.push({ url, method: init?.method ?? "GET" })
      if (url.endsWith("/session")) return new Response("[]")
      if (url.endsWith("/session/status")) return new Response("{}")
      if (url.endsWith("/session/one")) return new Response('{"id":"one","title":"One"}')
      if (url.endsWith("/session/one/diff")) return new Response("[]")
      return new Response(JSON.stringify({ healthy: true }))
    })
    await client.health()
    await client.sessions()
    await client.statuses()
    await client.session("one")
    await client.diff("one")
    expect(requests.every((request) => request.method === "GET")).toBe(true)
  })

  it("reports an interrupted event stream", async () => {
    const client = new OpenCodeClient("http://server.test", async () => {
      throw new Error("connection reset")
    })
    const stream = client.events()
    await expect(stream.next()).rejects.toThrow("disconnected")
  })

  it("loads the read-only dashboard resources", async () => {
    const client = new OpenCodeClient("http://server.test", async (input) => {
      const url = String(input)
      if (url.endsWith("/experimental/tool/ids")) return new Response('["bash"]')
      return new Response("[]")
    })
    await expect(client.agents()).resolves.toEqual([])
    await expect(client.toolIds()).resolves.toEqual(["bash"])
    await expect(client.mcp()).resolves.toEqual([])
    await expect(client.lsp()).resolves.toEqual([])
    await expect(client.formatters()).resolves.toEqual([])
    await expect(client.children("one")).resolves.toEqual([])
  })
})
