export type MonitorOptions = {
  baseUrl: string
  sessionId?: string
  help: boolean
}

export function parseOptions(args: string[]): MonitorOptions {
  let url: string | undefined
  let host: string | undefined
  let port: string | undefined
  let sessionId: string | undefined
  let help = false

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    const value = args[index + 1]

    if (argument === "--help" || argument === "-h") {
      help = true
    } else if (argument === "--url") {
      url = requireValue(argument, value)
      index += 1
    } else if (argument === "--host") {
      host = requireValue(argument, value)
      index += 1
    } else if (argument === "--port") {
      port = requireValue(argument, value)
      index += 1
    } else if (argument === "--session") {
      sessionId = requireValue(argument, value)
      index += 1
    } else {
      throw new Error(`Unknown option: ${argument}`)
    }
  }

  if (url && (host || port)) {
    throw new Error("Use --url or --host/--port, not both.")
  }

  if (port && (!Number.isInteger(Number(port)) || Number(port) < 1 || Number(port) > 65535)) {
    throw new Error("--port must be an integer between 1 and 65535.")
  }

  const baseUrl = url ?? `http://${host ?? "127.0.0.1"}:${port ?? "4096"}`

  try {
    const normalized = new URL(baseUrl)
    if (normalized.protocol !== "http:" && normalized.protocol !== "https:") {
      throw new Error()
    }
    return { baseUrl: normalized.toString().replace(/\/$/, ""), sessionId, help }
  } catch {
    throw new Error("--url must be a valid http:// or https:// URL.")
  }
}

function requireValue(option: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`)
  }
  return value
}

export const helpText = `Usage: opencode-monitor [options]

Observe one running OpenCode session without changing it.

Options:
  --url <url>        OpenCode server URL (default: http://127.0.0.1:4096)
  --host <host>      OpenCode server host (default: 127.0.0.1)
  --port <port>      OpenCode server port (default: 4096)
  --session <id>     Observe a session directly instead of choosing one
  -h, --help          Show this help message

Start OpenCode with a known address first, for example:
  opencode --port 4096`
