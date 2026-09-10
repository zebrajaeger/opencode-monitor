# opencode-monitor

`opencode-monitor` opens a read-only local browser dashboard for running OpenCode sessions. It does not send prompts, edit files, answer permissions, or change OpenCode configuration.

## Prerequisites

Start OpenCode with a stable server address before launching the monitor:

```bash
opencode --port 4096
```

## Usage

Run the package to open the dashboard, then choose a conversation in the browser:

```bash
npx opencode-monitor
```

Connect to a specific server and open the dashboard with one session selected:

```bash
npx opencode-monitor --url http://127.0.0.1:4096 --session <session-id>
```

Use host and port instead of a complete URL:

```bash
npx opencode-monitor --host 127.0.0.1 --port 4096
```

## Options

| Option | Description |
| --- | --- |
| `--url <url>` | OpenCode server URL. Cannot be combined with `--host` or `--port`. |
| `--host <host>` | OpenCode server host. Defaults to `127.0.0.1`. |
| `--port <port>` | OpenCode server port. Defaults to `4096`. |
| `--session <id>` | Watch one known session directly. |
| `-h`, `--help` | Show command help. |

The dashboard binds only to `127.0.0.1`, then opens the local URL in the default browser. It shows sessions, visible reasoning, tool states, todos, permission requests, errors, file changes reported by the selected session's read-only diff endpoint, and the OpenCode environment (agents, tools, MCP, LSP, and formatters). The observed runtime-activity view is best effort; it does not claim a complete subagent history. The monitor begins with new activity after connecting and does not reconstruct a complete session history.
