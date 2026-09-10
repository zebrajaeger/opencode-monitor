#!/usr/bin/env node
import { OpenCodeClient, type FileDiff, sessionStatus } from "./client.js"
import { changedFiles } from "./diff.js"
import { belongsToSession } from "./events.js"
import { helpText, parseOptions } from "./options.js"
import { renderEdit, renderEvent } from "./render.js"
import { selectSession } from "./select.js"
import type { Session, SessionSummary } from "./types.js"

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseOptions(args)
  if (options.help) {
    console.log(helpText)
    return
  }

  const client = new OpenCodeClient(options.baseUrl)
  await client.health()
  console.log(`Connected to OpenCode at ${options.baseUrl}`)

  const selected = await chooseSession(client, options.sessionId)
  console.log(`Watching: ${selected.title || "Untitled"} (${selected.id})`)

  let lastDiff: FileDiff[] = await client.diff(selected.id)
  const diffPoller = setInterval(() => {
    void printDiffChanges(client, selected.id, lastDiff)
      .then((diff) => {
        lastDiff = diff
      })
      .catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : String(error))
      })
  }, 1_000)

  try {
    for await (const event of client.events()) {
    if (!belongsToSession(event, selected.id)) continue
    const line = renderEvent(event)
    if (line) console.log(line)
    }
  } finally {
    clearInterval(diffPoller)
  }
}

async function printDiffChanges(client: OpenCodeClient, sessionId: string, previous: FileDiff[]): Promise<FileDiff[]> {
  const current = await client.diff(sessionId)
  for (const diff of changedFiles(previous, current)) console.log(renderEdit(diff.file))
  return current
}

async function chooseSession(client: OpenCodeClient, id: string | undefined): Promise<Session> {
  if (id) {
    try {
      return await client.session(id)
    } catch {
      throw new Error(`OpenCode session "${id}" was not found.`)
    }
  }

  const [sessions, statuses] = await Promise.all([client.sessions(), client.statuses()])
  const choices: SessionSummary[] = sessions.map((session) => ({
    ...session,
    status: sessionStatus(statuses[session.id]),
  }))
  return selectSession(choices)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
