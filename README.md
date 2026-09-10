# opencode-monitor

`opencode-monitor` is a read-only console monitor for one running OpenCode session. It does not send prompts, edit files, answer permissions, or change OpenCode configuration.

## Prerequisites

Start OpenCode with a stable server address before launching the monitor:

```bash
opencode --port 4096
```

## Usage

Run the package and choose a conversation interactively:

```bash
npx opencode-monitor
```

Connect to a specific server and session without a prompt:

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

The monitor shows session status, visible reasoning, tool states, todos, permission requests, errors, and file changes reported by the selected session's read-only diff endpoint. It begins with new activity after connecting; it does not reconstruct a complete session history.
