import { createServer, type Server, type ServerResponse } from "node:http"
import { once } from "node:events"
import { MonitorStore, type StoreEvent } from "./store.js"

export async function startDashboard(store: MonitorStore): Promise<{ server: Server; url: string }> {
  const clients = new Set<{ write: (chunk: string) => boolean }>()
  store.subscribe((event) => {
    const data = `data: ${JSON.stringify(event)}\n\n`
    for (const client of clients) client.write(data)
  })

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1")
    if (request.method !== "GET") return send(response, 405, "Method not allowed")
    if (url.pathname === "/") return send(response, 200, page, "text/html; charset=utf-8")
    if (url.pathname === "/api/snapshot") return json(response, 200, store.snapshot())
    if (url.pathname === "/api/events") {
      response.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" })
      response.write("retry: 1000\n\n")
      clients.add(response)
      request.on("close", () => clients.delete(response))
      return
    }
    const match = url.pathname.match(/^\/api\/sessions\/([^/]+)$/)
    if (match) {
      try {
        return json(response, 200, await store.watch(decodeURIComponent(match[1])))
      } catch (error) {
        return send(response, 404, error instanceof Error ? error.message : "Not found")
      }
    }
    return send(response, 404, "Not found")
  })
  server.listen(0, "127.0.0.1")
  await once(server, "listening")
  const address = server.address()
  if (!address || typeof address === "string") throw new Error("Dashboard did not bind to a TCP port.")
  return { server, url: `http://127.0.0.1:${address.port}` }
}

function json(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, JSON.stringify(body), "application/json")
}

function send(response: ServerResponse, status: number, body: string, type = "text/plain; charset=utf-8"): void {
  response.writeHead(status, { "Content-Type": type })
  response.end(body)
}

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>OpenCode Monitor</title><style>
*{box-sizing:border-box}body{margin:0;background:#101413;color:#e8ebe7;font:14px/1.45 ui-monospace,Consolas,monospace}header{padding:18px 22px;border-bottom:1px solid #31423e;color:#c0ff8f}main{display:grid;grid-template-columns:260px minmax(380px,1fr) 300px;min-height:calc(100vh - 60px)}section{padding:16px;border-right:1px solid #26322f}section:last-child{border:0}h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9cae9e;margin:0 0 12px}.session{width:100%;text-align:left;background:none;border:0;border-left:2px solid transparent;color:inherit;padding:9px;cursor:pointer}.session:hover,.session.selected{background:#1b2723;border-left-color:#c0ff8f}.status{float:right;font-size:11px;color:#c0ff8f}.event{border-bottom:1px solid #26322f;padding:10px 0}.time{display:inline-block;width:72px;color:#8c9a91}.tag{display:inline-block;width:86px;color:#c0ff8f}.muted{color:#8c9a91}.tree{padding-left:10px}.panel{margin-bottom:24px}.empty{color:#8c9a91}@media(max-width:850px){main{grid-template-columns:1fr}section{border-right:0;border-bottom:1px solid #26322f}.sessions{max-height:250px;overflow:auto}}
</style></head><body><header>OPENCODE MONITOR <span class="muted">local read-only dashboard</span></header><main><section class="sessions"><h2>Sessions</h2><div id="sessions"></div></section><section><h2 id="title">Select a session</h2><div id="timeline" class="empty">Choose a session to view live activity.</div></section><section><div class="panel"><h2>Environment</h2><div id="environment"></div></div><div class="panel"><h2>Session tree</h2><div id="tree" class="empty">No session selected.</div></div><div class="panel"><h2>Observed runtime activity</h2><div id="runtime" class="muted">Best effort from live events.</div></div></section></main><script>
let state,selected;const $=id=>document.getElementById(id);const escape=s=>String(s??'').replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
async function load(){state=await fetch('/api/snapshot').then(r=>r.json());renderSessions();renderEnvironment();const requested=new URLSearchParams(location.search).get('session');const initial=state.sessions.find(s=>s.id===requested)||state.sessions[0];if(initial)select(initial.id)}
function renderSessions(){ $('sessions').innerHTML=state.sessions.map(s=>'<button class="session '+(s.id===selected?'selected':'')+'" data-id="'+s.id+'">'+escape(s.title||'Untitled')+' <span class="status">'+s.status+(s.statusDetail?' '+escape(s.statusDetail):'')+'</span></button>').join('');document.querySelectorAll('.session').forEach(x=>x.onclick=()=>select(x.dataset.id))}
async function select(id){selected=id;renderSessions();const d=await fetch('/api/sessions/'+encodeURIComponent(id)).then(r=>r.json());$('title').textContent=(d.session.title||'Untitled')+' - '+d.session.status;$('timeline').innerHTML=d.timeline.length?d.timeline.map(e=>'<div class="event"><time class="time">'+new Date(e.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})+'</time><span class="tag">'+e.category+'</span>'+escape(e.text)+'</div>').join(''):'<span class="empty">Waiting for activity...</span>';$('tree').innerHTML=d.children.length?d.children.map(s=>'<div class="tree">+- '+escape(s.title||s.id)+' <span class="status">'+s.status+'</span></div>').join(''):'<span class="empty">No child sessions.</span>';$('runtime').innerHTML=d.runtime.length?d.runtime.map(a=>'<div>'+escape(a.label)+' <span class="status">'+escape(a.status)+'</span></div>').join(''):'Best effort from live events.'}
function renderEnvironment(){const e=state.environment;$('environment').innerHTML='<div class="panel"><b>Agents</b><br>'+list(e.agents.map(a=>a.name||a.id))+'</div><div class="panel"><b>Tools</b><br>'+list(e.tools)+'</div><div class="panel"><b>MCP</b><br>'+list(e.mcp.map(x=>(x.name||'unnamed')+' '+(x.status||'')))+'</div><div class="panel"><b>LSP / Formatters</b><br>'+list([...e.lsp,...e.formatters].map(x=>x.name||'unnamed'))+'</div>'}function list(items){return items.length?items.map(escape).join('<br>'):'<span class="muted">None reported</span>'}
const stream=new EventSource('/api/events');stream.onmessage=e=>{const change=JSON.parse(e.data);if(change.type==='session'){const i=state.sessions.findIndex(s=>s.id===change.session.id);if(i>=0)state.sessions[i]=change.session;renderSessions()}if((change.type==='timeline'||change.type==='runtime')&&change.sessionId===selected)select(selected)};load();
</script></body></html>`
