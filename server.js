import http from "http";
import axios from "axios";
import crypto from "crypto";

const tracks = new Map();
let server;
let startPromise;

const PAGE = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#09090d"><title>NERO BOTZ • PLAY2</title>
<style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(ellipse at 50% 0,#3b101b 0,#151018 42%,#08090d 100%);font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#fff;display:grid;place-items:center;padding:22px}
.player{width:min(440px,100%);background:linear-gradient(160deg,#242027,#101116 70%);border:1px solid #47313a;border-radius:30px;padding:25px;box-shadow:0 25px 80px #0009}
.brand{display:flex;align-items:center;justify-content:space-between;color:#ff667c;font-weight:800;letter-spacing:2px;font-size:13px}
.pill{font-size:11px;color:#bbb;border:1px solid #51434a;border-radius:30px;padding:6px 10px}
.cover{width:100%;aspect-ratio:1;margin:25px auto 22px;border-radius:22px;object-fit:cover;background:linear-gradient(135deg,#5d1529,#171820);box-shadow:0 15px 35px #0008}
h1{font-size:23px;line-height:1.2;margin:0 0 7px;overflow-wrap:anywhere}.artist{color:#b8b2b8;margin:0 0 22px}
.controls{display:flex;align-items:center;justify-content:center;gap:25px;margin:17px 0}.play{width:66px;height:66px;border:0;border-radius:50%;background:#f04462;color:white;font-size:25px;box-shadow:0 8px 25px #f0446244}
.small{border:0;background:none;color:#ddd;font-size:23px}.timeline{width:100%;accent-color:#f04462}.times{display:flex;justify-content:space-between;color:#aaa;font-size:12px;margin-top:4px}
.volume{display:flex;gap:12px;align-items:center;margin-top:18px;color:#aaa}.volume input{flex:1;accent-color:#f04462}
.search{display:flex;gap:8px;margin-top:25px}.search input{min-width:0;flex:1;background:#090a0f;border:1px solid #3d3038;border-radius:14px;padding:13px;color:white}.search button{background:#f04462;border:0;border-radius:14px;padding:0 16px;color:white;font-weight:700}
.status{min-height:20px;color:#c8aab2;font-size:12px;text-align:center;margin-top:15px}.footer{text-align:center;color:#716b72;font-size:11px;margin-top:18px}
button{cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}
</style></head><body><main class="player">
<div class="brand"><span>◈ NERO BOTZ</span><span class="pill">PLAY2 PLAYER</span></div>
<img id="cover" class="cover" alt="Cover lagu" src="">
<h1 id="title">Memuat pemutar...</h1><p id="artist" class="artist">NERO BOTZ MUSIC</p>
<audio id="audio" preload="metadata"></audio>
<input id="seek" class="timeline" type="range" min="0" max="1000" value="0">
<div class="times"><span id="current">0:00</span><span id="duration">0:00</span></div>
<div class="controls"><button class="small" id="restart" aria-label="Ulangi">↺</button><button class="play" id="toggle" aria-label="Putar">▶</button><button class="small" id="mute" aria-label="Mute">♪</button></div>
<div class="volume"><span>VOL</span><input id="volume" type="range" min="0" max="1" step=".01" value=".85"></div>
<form class="search" id="search"><input id="query" placeholder="Cari lagu lain..." autocomplete="off"><button type="submit">Cari</button></form>
<div id="status" class="status">Siap memutar musik</div><div class="footer">NERO BOTZ • PREMIUM MUSIC EXPERIENCE</div>
</main><script>
const id=location.pathname.split('/').pop(),audio=document.querySelector('#audio');
const $=s=>document.querySelector(s);const fmt=n=>{if(!Number.isFinite(n))return'0:00';let m=Math.floor(n/60),s=Math.floor(n%60);return m+':'+String(s).padStart(2,'0')};
async function loadTrack(trackId){$(' #status');$(' #status');$('#status').textContent='Menyiapkan lagu...';try{const r=await fetch('/api/play2/'+encodeURIComponent(trackId));if(!r.ok)throw Error('Lagu tidak ditemukan atau link kedaluwarsa');const d=await r.json();$('#title').textContent=d.title||'Unknown title';$('#artist').textContent=d.artist||d.channel||'Unknown artist';$('#cover').src=d.thumbnail||'';audio.src='/api/play2/'+encodeURIComponent(trackId)+'/audio';audio.load();$('#status').textContent='Lagu siap diputar';}catch(e){$('#status').textContent=e.message;}}
$('#toggle').onclick=async()=>{if(audio.paused){try{await audio.play();$('#toggle').textContent='Ⅱ';$('#status').textContent='Sedang diputar';}catch(e){$('#status').textContent='Tekan Play untuk mulai memutar';}}else{audio.pause();$('#toggle').textContent='▶';$('#status').textContent='Dijeda';}};
$('#restart').onclick=()=>{audio.currentTime=0;audio.play().catch(()=>{});$('#toggle').textContent='Ⅱ';};
$('#mute').onclick=()=>{audio.muted=!audio.muted;$('#mute').textContent=audio.muted?'×':'♪';};
$('#volume').oninput=e=>audio.volume=Number(e.target.value);
audio.ontimeupdate=()=>{if(audio.duration){$('#seek').value=audio.currentTime/audio.duration*1000;$('#current').textContent=fmt(audio.currentTime);$('#duration').textContent=fmt(audio.duration);}};
$('#seek').oninput=e=>{if(audio.duration)audio.currentTime=Number(e.target.value)/1000*audio.duration;};
audio.onended=()=>{$('#toggle').textContent='▶';$('#status').textContent='Selesai diputar';};
audio.onerror=()=>$('#status').textContent='Audio gagal dimuat. Coba cari ulang.';
$('#search').onsubmit=async e=>{e.preventDefault();let q=$('#query').value.trim();if(!q)return;$('#status').textContent='Mencari lagu...';try{let r=await fetch('/api/search?q='+encodeURIComponent(q));let d=await r.json();if(!r.ok)throw Error(d.error||'Pencarian gagal');history.replaceState({},'', '/play2/'+d.id);await loadTrack(d.id);audio.play().then(()=>$('#toggle').textContent='Ⅱ').catch(()=>{});}catch(err){$('#status').textContent=err.message;}};
loadTrack(id);
</script></body></html>`;

function json(res, status, data) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "access-control-allow-origin": "*" });
  res.end(JSON.stringify(data));
}
function getPublicBase() {
  return String(process.env.PLAY2_PUBLIC_URL || process.env.PUBLIC_URL || "").replace(/\/+$/, "");
}
async function searchTrack(query) {
  const response = await axios.get("https://api.azbry.com/api/download/ytplay2", {
    params: { q: query }, timeout: 90000, headers: { Accept: "application/json" }
  });
  const d = response.data?.result;
  if (response.data?.status !== true || !d?.download || !/^https?:\/\//i.test(d.download)) {
    throw new Error("API YouTube tidak menemukan audio untuk lagu ini.");
  }
  const id = crypto.randomBytes(12).toString("hex");
  tracks.set(id, { ...d, createdAt: Date.now() });
  for (const [key, value] of tracks) if (Date.now() - value.createdAt > 6 * 60 * 60 * 1000) tracks.delete(key);
  return { id, title: d.title || query, artist: d.channel || "YouTube", thumbnail: d.thumbnail || d.image || "" };
}
export async function startPlay2Server() {
  if (server?.listening) return server;
  if (startPromise) return startPromise;
  startPromise = new Promise((resolve, reject) => {
    const port = Number(process.env.PORT || process.env.PLAY2_PORT || 3000);
    server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
        if (url.pathname === "/health") return json(res, 200, { ok: true, service: "NERO PLAY2" });
        if (url.pathname === "/") { res.writeHead(302, { location: "/health" }); return res.end(); }
        if (url.pathname === "/api/search") {
          const q = String(url.searchParams.get("q") || "").trim().slice(0, 180);
          if (!q) return json(res, 400, { error: "Masukkan judul lagu." });
          try { return json(res, 200, await searchTrack(q)); }
          catch (e) { return json(res, 502, { error: e.message || "Pencarian gagal." }); }
        }
        const match = url.pathname.match(/^\/api\/play2\/([a-f0-9]{24})(\/audio)?$/);
        if (match) {
          const track = tracks.get(match[1]);
          if (!track || Date.now() - track.createdAt > 6 * 60 * 60 * 1000) return json(res, 404, { error: "Link lagu kedaluwarsa. Cari ulang." });
          if (!match[2]) return json(res, 200, { title: track.title, artist: track.channel || "", thumbnail: track.thumbnail || track.image || "" });
          const audio = await axios.get(track.download, { responseType: "stream", timeout: 120000, maxRedirects: 5, headers: { Accept: "audio/*, application/octet-stream" } });
          res.writeHead(200, { "content-type": audio.headers["content-type"]?.includes("audio") ? audio.headers["content-type"] : "audio/mpeg", "cache-control": "no-store", ...(audio.headers["content-length"] ? { "content-length": audio.headers["content-length"] } : {}) });
          audio.data.on("error", () => res.destroy());
          return audio.data.pipe(res);
        }
        const pageMatch = url.pathname.match(/^\/play2\/([a-f0-9]{24})$/);
        if (pageMatch && tracks.has(pageMatch[1])) {
          res.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
          return res.end(PAGE);
        }
        return json(res, 404, { error: "Halaman tidak ditemukan." });
      } catch (e) {
        if (!res.headersSent) json(res, 500, { error: "Server player mengalami kesalahan." });
        else res.destroy();
        console.error("[PLAY2 SERVER]", e);
      }
    });
    server.on("error", reject);
    server.listen(port, "0.0.0.0", () => resolve(server));
  }).finally(() => { startPromise = null; });
  return startPromise;
}
export function getPlay2PublicUrl() { return getPublicBase(); }
