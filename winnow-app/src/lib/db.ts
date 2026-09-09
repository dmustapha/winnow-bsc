// File: src/lib/db.ts
import Database from "better-sqlite3";
import { DB_PATH } from "./config";
import fs from "node:fs";
fs.mkdirSync(require("node:path").dirname(DB_PATH), { recursive: true });
export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS agents (
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  name TEXT, description TEXT, owner TEXT, image_url TEXT,
  mcp_server TEXT, a2a_endpoint TEXT, x402 INTEGER DEFAULT 0,
  category TEXT, is_reference INTEGER DEFAULT 0,
  scan_feedbacks INTEGER DEFAULT 0, scan_score REAL,
  created_at TEXT, indexed_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (chain_id, token_id));
CREATE TABLE IF NOT EXISTS probe_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  ran_at TEXT DEFAULT (datetime('now')),
  transcript TEXT NOT NULL,           -- raw JSON of every check
  liveness INTEGER NOT NULL, meta INTEGER NOT NULL,
  feedback INTEGER NOT NULL, track INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS grades (
  chain_id INTEGER NOT NULL, token_id INTEGER NOT NULL,
  probe_log_id INTEGER NOT NULL REFERENCES probe_logs(id),  -- INVARIANT 1
  score INTEGER NOT NULL, letter TEXT NOT NULL,
  graded_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (chain_id, token_id));
CREATE TABLE IF NOT EXISTS attestations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chain_id INTEGER, token_id INTEGER, tag TEXT, value INTEGER,
  tx_hash TEXT NOT NULL, attested_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_chain INTEGER, agent_token INTEGER, agent_wallet TEXT,
  session_key TEXT, cap_wei TEXT, expiry INTEGER,
  grant_tx TEXT, revoke_tx TEXT, status TEXT DEFAULT 'live',
  created_at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS agent_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_token INTEGER, kind TEXT, detail TEXT, tx_hash TEXT,
  reasoning TEXT, at TEXT DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT);
CREATE INDEX IF NOT EXISTS idx_agents_cat ON agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_probe ON agents(mcp_server) WHERE mcp_server IS NOT NULL;
`);
export const kvGet = (k: string) => (db.prepare("SELECT v FROM kv WHERE k=?").get(k) as any)?.v as string | undefined;
export const kvSet = (k: string, v: string) => db.prepare("INSERT INTO kv(k,v) VALUES(?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v").run(k, v);
