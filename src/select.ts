import { createInterface } from "node:readline/promises"
import { stdin, stdout } from "node:process"
import type { SessionSummary } from "./types.js"

export async function selectSession(sessions: SessionSummary[]): Promise<SessionSummary> {
  if (sessions.length === 0) throw new Error("No OpenCode sessions are available.")

  stdout.write("Available conversations:\n")
  for (const [index, session] of sessions.entries()) {
    stdout.write(`  ${index + 1}  ${session.title || "Untitled"}  ${shortId(session.id)}  ${session.status}\n`)
  }

  const prompt = createInterface({ input: stdin, output: stdout })
  try {
    const answer = await prompt.question("Choose a conversation: ")
    return sessions[parseSessionChoice(answer, sessions.length)]
  } finally {
    prompt.close()
  }
}

export function parseSessionChoice(answer: string, count: number): number {
  const choice = Number(answer)
  if (!Number.isInteger(choice) || choice < 1 || choice > count) {
    throw new Error("Choose a valid conversation number.")
  }
  return choice - 1
}

export function shortId(id: string): string {
  return id.length > 8 ? id.slice(0, 8) : id
}
