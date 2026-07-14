/**
 * src/utils/db.js
 * ──────────────────────────────────────────────────────────────────────────────
 * SQLite message storage for Zyron.
 *
 * All database operations are fully async so they never block the JS thread.
 *
 * SCHEMA
 * ──────
 * messages
 *   id          TEXT  PRIMARY KEY
 *   session_id  TEXT  NOT NULL  INDEXED
 *   sender      TEXT  NOT NULL
 *   text        TEXT  NOT NULL DEFAULT ''
 *   mode        TEXT
 *   team_id     TEXT
 *   team_name   TEXT
 *   agents      TEXT   — JSON array
 *   token_usage TEXT   — JSON object
 *   code_lines  TEXT   — JSON array (legacy)
 *   timestamp   TEXT  NOT NULL DEFAULT ''
 *   sort_key    INTEGER NOT NULL DEFAULT 0
 *
 * PUBLIC API  (all return Promises)
 *   initDb()
 *   loadMessages(sessionId, limit, offset)
 *   getMessageCount(sessionId)
 *   insertMessage(sessionId, msg)
 *   replaceSessionMessages(sessionId, msgs)
 *   deleteSessionMessages(sessionId)
 *   deleteAllMessages()
 */

import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME       = 'zyron_messages.db';
const MIGRATION_FLAG = 'zyron_SQLITE_MIGRATED_v1';
const PAGE_SIZE      = 30;

let _db = null;

// ─── Ready promise (resolved once initDb completes) ──────────────────────────
// All public read/write calls await this before touching the DB, so they never
// race with initDb() on a cold launch or hot-reload cycle.

let _readyResolve = null;
const _readyPromise = new Promise((resolve) => { _readyResolve = resolve; });

// ─── Open db (async, singleton) ──────────────────────────────────────────────

async function getDb() {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return _db;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

async function createSchema(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS messages (
      id          TEXT    PRIMARY KEY,
      session_id  TEXT    NOT NULL,
      sender      TEXT    NOT NULL,
      text        TEXT    NOT NULL DEFAULT '',
      mode        TEXT,
      team_id     TEXT,
      team_name   TEXT,
      agents      TEXT,
      token_usage TEXT,
      code_lines  TEXT,
      timestamp   TEXT    NOT NULL DEFAULT '',
      sort_key    INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_sort
      ON messages (session_id, sort_key);
  `);
}

// ─── Row ↔ message conversion ─────────────────────────────────────────────────

function rowToMsg(row) {
  return {
    id:         row.id,
    sender:     row.sender,
    text:       row.text        || '',
    mode:       row.mode        || undefined,
    teamId:     row.team_id     || undefined,
    teamName:   row.team_name   || undefined,
    agents:     row.agents      ? JSON.parse(row.agents)      : [],
    tokenUsage: row.token_usage ? JSON.parse(row.token_usage) : undefined,
    codeLines:  row.code_lines  ? JSON.parse(row.code_lines)  : [],
    timestamp:  row.timestamp   || '',
  };
}

function msgToParams(sessionId, msg, sortKey) {
  return [
    String(msg.id),
    String(sessionId),
    msg.sender     || 'user',
    msg.text       || '',
    msg.mode       || null,
    msg.teamId     || null,
    msg.teamName   || null,
    msg.agents     ? JSON.stringify(msg.agents)     : null,
    msg.tokenUsage ? JSON.stringify(msg.tokenUsage) : null,
    msg.codeLines  ? JSON.stringify(msg.codeLines)  : null,
    msg.timestamp  || '',
    sortKey,
  ];
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

async function runMigrationIfNeeded(db) {
  try {
    const flag = await AsyncStorage.getItem(MIGRATION_FLAG);
    if (flag === 'true') return;
  } catch (_) {}

  let allKeys = [];
  try {
    allKeys = await AsyncStorage.getAllKeys();
  } catch (err) {
    console.warn('[db] Migration: could not read AsyncStorage keys:', err);
    return;
  }

  const messageKeys = allKeys.filter((k) => k.startsWith('zyron_MESSAGES_'));

  if (messageKeys.length === 0) {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'true');
    return;
  }

  console.log(`[db] Migrating ${messageKeys.length} conversation(s) to SQLite…`);

  for (const key of messageKeys) {
    const sessionId = key.slice('zyron_MESSAGES_'.length);
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) { await AsyncStorage.removeItem(key); continue; }

      const msgs = JSON.parse(raw);
      if (!Array.isArray(msgs) || msgs.length === 0) {
        await AsyncStorage.removeItem(key);
        continue;
      }

      await db.withTransactionAsync(async () => {
        await db.runAsync('DELETE FROM messages WHERE session_id = ?', [sessionId]);
        for (let idx = 0; idx < msgs.length; idx++) {
          await db.runAsync(
            `INSERT OR REPLACE INTO messages
               (id, session_id, sender, text, mode, team_id, team_name,
                agents, token_usage, code_lines, timestamp, sort_key)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            msgToParams(sessionId, msgs[idx], idx)
          );
        }
      });

      await AsyncStorage.removeItem(key);
    } catch (err) {
      console.warn(`[db] Migration: skipping session "${sessionId}":`, err.message || err);
    }
  }

  try {
    await AsyncStorage.setItem(MIGRATION_FLAG, 'true');
    console.log('[db] Migration complete.');
  } catch (err) {
    console.warn('[db] Could not save migration flag:', err);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function initDb() {
  const db = await getDb();
  await createSchema(db);
  await runMigrationIfNeeded(db);
  // Signal all waiting callers that the DB is ready
  _readyResolve?.();
}

export async function loadMessages(sessionId, limit = PAGE_SIZE, offset = 0) {
  await _readyPromise;
  const db = await getDb();
  const countRow = await db.getFirstAsync(
    'SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?',
    [sessionId]
  );
  const total = countRow?.cnt ?? 0;
  if (total === 0) return [];

  const rows = await db.getAllAsync(
    `SELECT * FROM messages
     WHERE session_id = ?
     ORDER BY sort_key DESC
     LIMIT ? OFFSET ?`,
    [sessionId, limit, offset]
  );

  return rows.reverse().map(rowToMsg);
}

export async function getMessageCount(sessionId) {
  await _readyPromise;
  const db = await getDb();
  const row = await db.getFirstAsync(
    'SELECT COUNT(*) as cnt FROM messages WHERE session_id = ?',
    [sessionId]
  );
  return row?.cnt ?? 0;
}

export async function insertMessage(sessionId, msg) {
  await _readyPromise;
  const db = await getDb();
  const maxRow = await db.getFirstAsync(
    'SELECT COALESCE(MAX(sort_key), -1) as mx FROM messages WHERE session_id = ?',
    [sessionId]
  );
  const sortKey = (maxRow?.mx ?? -1) + 1;
  await db.runAsync(
    `INSERT OR REPLACE INTO messages
       (id, session_id, sender, text, mode, team_id, team_name,
        agents, token_usage, code_lines, timestamp, sort_key)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    msgToParams(sessionId, msg, sortKey)
  );
}

export async function replaceSessionMessages(sessionId, msgs) {
  await _readyPromise;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM messages WHERE session_id = ?', [sessionId]);
    for (let idx = 0; idx < msgs.length; idx++) {
      await db.runAsync(
        `INSERT INTO messages
           (id, session_id, sender, text, mode, team_id, team_name,
            agents, token_usage, code_lines, timestamp, sort_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        msgToParams(sessionId, msgs[idx], idx)
      );
    }
  });
}

export async function deleteSessionMessages(sessionId) {
  await _readyPromise;
  const db = await getDb();
  await db.runAsync('DELETE FROM messages WHERE session_id = ?', [sessionId]);
}

export async function deleteAllMessages() {
  await _readyPromise;
  const db = await getDb();
  await db.runAsync('DELETE FROM messages');
}
