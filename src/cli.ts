#!/usr/bin/env node
import { OpenCodeClient } from "./client.js"
import { helpText, parseOptions } from "./options.js"
import { startDashboard } from "./server.js"
import { MonitorStore } from "./store.js"

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseOptions(args)
  if (options.help) {
    console.log(helpText)
    return
  }

  const client = new OpenCodeClient(options.baseUrl)
  await client.health()
  const store = new MonitorStore(client)
  await store.initialize()
  const dashboard = await startDashboard(store)
  const url = options.sessionId ? `${dashboard.url}/?session=${encodeURIComponent(options.sessionId)}` : dashboard.url
  console.log(`OpenCode Monitor: ${url}`)
  await openBrowser(url)

  for await (const event of client.events()) store.apply(event)
}

async function openBrowser(url: string): Promise<void> {
  try {
    const { exec } = await import("node:child_process")
    const command = process.platform === "win32" ? `start "" "${url}"` : process.platform === "darwin" ? `open "${url}"` : `xdg-open "${url}"`
    exec(command)
  } catch {
    // The local URL has already been printed for manual browser opening.
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
