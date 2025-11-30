/**
 * Expense Tracker (no MySQL)
 * - Backend: Node.js + Express
 * - Storage: JSON file persisted at /data/expenses.json
 * - Frontend: Inline HTML/CSS/JS (served at GET /)
 *
 * Docker tip:
 *   Bind-mount or volume-map a host directory to /data for persistence.
 */

const fs = require("fs");
const path = require("path");
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8080;
const DATA_DIR = process.env.DATA_DIR || "/data";
const DATA_FILE = path.join(DATA_DIR, "expenses.json");

// --- tiny JSON "DB" helpers ---
function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ lastId: 0, items: [] }, null, 2));
}

function readStore() {
  ensureStore();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (e) {
    return { lastId: 0, items: [] };
  }
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

// --- frontend (no nested backticks inside) ---
const INDEX_HTML =
'<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Expense Tracker (File)</title>' +
'<meta name="viewport" content="width=device-width, initial-scale=1" />' +
'<style>:root{--bg:#0b1220;--card:#111a2b;--muted:#9fb0d1;--text:#e8eefc;--accent:#5aa9ff;--accent-2:#7cffc4;--danger:#ff6b6b}' +
'*{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial}' +
'body{background:#0b1220;color:var(--text);margin:0;padding:24px}' +
'h1{margin:0 0 12px;font-weight:700;letter-spacing:.3px}.sub{color:var(--muted);margin-bottom:24px}' +
'.app{max-width:980px;margin:0 auto;display:grid;gap:18px}.card{background:var(--card);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}' +
'.row{display:flex;gap:12px;flex-wrap:wrap}input,select,button{border-radius:10px;border:1px solid rgba(255,255,255,.08);background:#0c1323;color:var(--text);padding:10px 12px}' +
'input::placeholder{color:#8293b3}button{cursor:pointer;background:linear-gradient(90deg,var(--accent),#7fb2ff);font-weight:700;border:none}' +
'button:disabled{opacity:.6;cursor:not-allowed}table{width:100%;border-collapse:separate;border-spacing:0 8px}' +
'th,td{padding:10px 12px;text-align:left}thead th{color:var(--muted);font-weight:600}tbody tr{background:#0e1730;border:1px solid rgba(255,255,255,.06)}' +
'tbody tr td:first-child{border-top-left-radius:12px;border-bottom-left-radius:12px}tbody tr td:last-child{border-top-right-radius:12px;border-bottom-right-radius:12px}' +
'.amount{font-weight:700}.cat{color:var(--accent-2)}.muted{color:var(--muted)}.stats{display:flex;gap:14px;flex-wrap:wrap}.pill{background:#0c1323;border:1px solid rgba(255,255,255,.06);padding:8px 12px;border-radius:999px}.total{font-weight:800}.sep{height:1px;background:rgba(255,255,255,.06);margin:10px 0}</style>' +
'</head><body><div class="app"><header><h1>Expense Tracker</h1><div class="sub">No MySQL — data persists to a JSON file via Docker volume.</div></header>' +
'<section class="card"><h3 style="margin-top:0">Add Expense</h3><div class="row">' +
'<input id="title" placeholder="Title (e.g., Coffee)" />' +
'<input id="amount" placeholder="Amount (e.g., 4.50)" type="number" step="0.01" min="0" />' +
'<input id="category" placeholder="Category (e.g., Food)" />' +
'<input id="date" type="date" />' +
'<button id="addBtn">Add</button></div><div id="addMsg" class="muted" style="margin-top:8px"></div></section>' +
'<section class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:6px"><h3 style="margin:0">Expenses</h3>' +
'<button id="refreshBtn" title="Refresh list">Refresh</button></div><div class="sep"></div>' +
'<table><thead><tr><th>Title</th><th>Amount</th><th>Category</th><th>Date</th><th></th></tr></thead><tbody id="tbody"></tbody></table>' +
'<div id="empty" class="muted" style="display:none">No expenses yet.</div></section>' +
'<section class="card"><h3 style="margin-top:0">Stats</h3><div class="stats" id="stats"></div></section></div>' +
'<script>' +
'async function api(path, opts){const res=await fetch(path,Object.assign({headers:{"Content-Type":"application/json"}},opts||{}));if(!res.ok){throw new Error(await res.text())}return res.json()}' +
'async function loadList(){const data=await api("/api/expenses");const tbody=document.getElementById("tbody");const empty=document.getElementById("empty");tbody.innerHTML="";if(data.length===0){empty.style.display="block";return}empty.style.display="none";for(var i=0;i<data.length;i++){var row=data[i];var dateStr=(row.spent_at||"").substring(0,10);var html=""+' +
'"<td>"+row.title+"</td>"+' +
'"<td class=\\"amount\\">"+Number(row.amount).toFixed(2)+"</td>"+' +
'"<td class=\\"cat\\">"+row.category+"</td>"+' +
'"<td>"+dateStr+"</td>"+' +
'"<td><button class=\\"danger\\" data-id=\\""+row.id+"\\">Delete</button></td>";' +
'var tr=document.createElement("tr");tr.innerHTML=html;tbody.appendChild(tr)}Array.prototype.forEach.call(tbody.querySelectorAll("button[data-id]"),function(btn){btn.addEventListener("click",async function(){var id=btn.getAttribute("data-id");btn.disabled=true;try{await api("/api/expenses/"+id,{method:"DELETE"});await loadList();await loadStats()}catch(e){alert("Delete failed: "+e.message)}finally{btn.disabled=false}})})}' +
'async function loadStats(){const s=await api("/api/stats");const stats=document.getElementById("stats");stats.innerHTML="";var total=document.createElement("div");total.className="pill total";total.textContent="Total: "+Number(s.total||0).toFixed(2);stats.appendChild(total);var arr=s.byCategory||[];for(var i=0;i<arr.length;i++){var d=document.createElement("div");d.className="pill";d.textContent=arr[i].category+": "+Number(arr[i].sum).toFixed(2);stats.appendChild(d)}}' +
'async function addExpense(){var msg=document.getElementById("addMsg");var title=document.getElementById("title").value.trim();var amount=parseFloat(document.getElementById("amount").value||"0");var category=document.getElementById("category").value.trim()||"General";var date=document.getElementById("date").value;if(!title||!amount||!date){msg.textContent="Please provide title, amount, and date.";return}document.getElementById("addBtn").disabled=true;try{await api("/api/expenses",{method:"POST",body:JSON.stringify({title:title,amount:amount,category:category,spent_at:date})});document.getElementById("title").value="";document.getElementById("amount").value="";document.getElementById("category").value="";document.getElementById("date").value="";msg.textContent="Added.";await loadList();await loadStats()}catch(e){msg.textContent="Add failed: "+e.message}finally{document.getElementById("addBtn").disabled=false;setTimeout(function(){msg.textContent=""},1500)}}' +
'document.getElementById("addBtn").addEventListener("click",addExpense);' +
'document.getElementById("refreshBtn").addEventListener("click",async function(){await loadList();await loadStats()});' +
'window.addEventListener("DOMContentLoaded",async function(){await loadList();await loadStats()});' +
'</' + 'script></body></html>';

// routes
app.get("/", (_req, res) => {
  res.set("Content-Type", "text/html; charset=utf-8");
  res.send(INDEX_HTML);
});

// list
app.get("/api/expenses", (_req, res) => {
  try {
    const store = readStore();
    const rows = store.items
      .slice()
      .sort((a, b) => (b.spent_at || "").localeCompare(a.spent_at || "") || b.id - a.id);
    res.json(rows);
  } catch (e) {
    console.error("GET /api/expenses error:", e.message);
    res.status(500).send("Store error");
  }
});

// add
app.post("/api/expenses", (req, res) => {
  try {
    const body = req.body || {};
    const title = (body.title || "").trim();
    const amount = Number(body.amount || 0);
    const category = (body.category || "General").trim();
    const spent_at = body.spent_at || "";
    if (!title || !amount || !spent_at) return res.status(400).send("Missing fields");

    const store = readStore();
    const id = ++store.lastId;
    store.items.push({ id, title, amount, category, spent_at });
    writeStore(store);
    res.json({ ok: true, id });
  } catch (e) {
    console.error("POST /api/expenses error:", e.message);
    res.status(500).send("Store error");
  }
});

// delete
app.delete("/api/expenses/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const store = readStore();
    const before = store.items.length;
    store.items = store.items.filter(x => x.id !== id);
    if (store.items.length === before) return res.status(404).send("Not found");
    writeStore(store);
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/expenses/:id error:", e.message);
    res.status(500).send("Store error");
  }
});

// stats
app.get("/api/stats", (_req, res) => {
  try {
    const store = readStore();
    const total = store.items.reduce((s, x) => s + Number(x.amount || 0), 0);
    const map = {};
    for (const x of store.items) {
      const k = x.category || "General";
      map[k] = (map[k] || 0) + Number(x.amount || 0);
    }
    const byCategory = Object.keys(map)
      .sort((a, b) => map[b] - map[a])
      .map(k => ({ category: k, sum: map[k] }));
    res.json({ total, byCategory });
  } catch (e) {
    console.error("GET /api/stats error:", e.message);
    res.status(500).send("Store error");
  }
});

app.listen(PORT, () => {
  ensureStore();
  console.log("Server listening on :" + PORT);
  console.log("Data file: " + DATA_FILE);
});

