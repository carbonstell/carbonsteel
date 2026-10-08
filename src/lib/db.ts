import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { QuoteRequest, QuoteItem, RequestStatus } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "quotes.db");

// اطمینان از وجود پوشه data
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// فعال کردن foreign keys و WAL برای پایداری بیشتر
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ساخت جداول
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    tracking_code TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    customer_name TEXT NOT NULL,
    company_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    notes TEXT,
    validity_days INTEGER,
    valid_until TEXT,
    total_amount REAL,
    admin_notes TEXT,
    quoted_at TEXT,
    delivery_time TEXT,
    delivery_location TEXT
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    unit_price REAL,
    total_price REAL,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL,
    password_hash TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_tracking_code ON requests(tracking_code);
  CREATE INDEX IF NOT EXISTS idx_status ON requests(status);
`);

// ایجاد ادمین پیش‌فرض اگر وجود نداشته باشد
const adminExists = db.prepare("SELECT COUNT(*) as count FROM admin").get() as { count: number };
if (adminExists.count === 0) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)").run("admin", hash);
}

// ========== توابع کمکی ==========

function rowToRequest(row: any, items: QuoteItem[]): QuoteRequest {
  return {
    id: row.id,
    trackingCode: row.tracking_code,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status as RequestStatus,
    customerName: row.customer_name,
    companyName: row.company_name || undefined,
    phone: row.phone,
    email: row.email || undefined,
    address: row.address || undefined,
    notes: row.notes || undefined,
    validityDays: row.validity_days || undefined,
    validUntil: row.valid_until || undefined,
    totalAmount: row.total_amount || undefined,
    adminNotes: row.admin_notes || undefined,
    quotedAt: row.quoted_at || undefined,
    deliveryTime: row.delivery_time || undefined,
    deliveryLocation: row.delivery_location || undefined,
    items,
  };
}

function getItems(requestId: string): QuoteItem[] {
  const rows = db.prepare("SELECT * FROM items WHERE request_id = ?").all(requestId) as any[];
  return rows.map((r) => ({
    id: r.id,
    description: r.description,
    quantity: r.quantity,
    unit: r.unit,
    unitPrice: r.unit_price ?? undefined,
    totalPrice: r.total_price ?? undefined,
  }));
}

// ========== توابع اصلی ==========

export function getRequests(): QuoteRequest[] {
  const rows = db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all() as any[];
  return rows.map((row) => rowToRequest(row, getItems(row.id)));
}

export function getRequestById(id: string): QuoteRequest | null {
  const row = db.prepare("SELECT * FROM requests WHERE id = ?").get(id) as any;
  if (!row) return null;
  return rowToRequest(row, getItems(id));
}

export function getRequestByTrackingCode(code: string): QuoteRequest | null {
  const row = db.prepare("SELECT * FROM requests WHERE tracking_code = ?").get(code) as any;
  if (!row) return null;
  return rowToRequest(row, getItems(row.id));
}

export function addRequest(
  data: Omit<QuoteRequest, "id" | "trackingCode" | "createdAt" | "updatedAt" | "status">
): QuoteRequest {
  const id = uuidv4();
  const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();
  const now = new Date().toISOString();

  const insertRequest = db.prepare(`
    INSERT INTO requests (
      id, tracking_code, created_at, updated_at, status,
      customer_name, company_name, phone, email, address, notes
    ) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO items (id, request_id, description, quantity, unit)
    VALUES (?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    insertRequest.run(
      id,
      trackingCode,
      now,
      now,
      data.customerName,
      data.companyName || null,
      data.phone,
      data.email || null,
      data.address || null,
      data.notes || null
    );

    for (const item of data.items) {
      insertItem.run(uuidv4(), id, item.description, item.quantity, item.unit);
    }
  });

  transaction();

  return getRequestById(id)!;
}

export function updateRequest(
  id: string,
  updates: Partial<QuoteRequest>
): QuoteRequest | null {
  const existing = getRequestById(id);
  if (!existing) return null;

  const now = new Date().toISOString();

  const updateStmt = db.prepare(`
    UPDATE requests SET
      updated_at = ?,
      status = COALESCE(?, status),
      validity_days = COALESCE(?, validity_days),
      valid_until = COALESCE(?, valid_until),
      total_amount = COALESCE(?, total_amount),
      admin_notes = COALESCE(?, admin_notes),
      quoted_at = COALESCE(?, quoted_at),
      delivery_time = COALESCE(?, delivery_time),
      delivery_location = COALESCE(?, delivery_location)
    WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    updateStmt.run(
      now,
      updates.status || null,
      updates.validityDays ?? null,
      updates.validUntil || null,
      updates.totalAmount ?? null,
      updates.adminNotes || null,
      updates.quotedAt || null,
      updates.deliveryTime || null,
      updates.deliveryLocation || null,
      id
    );

    // اگر آیتم‌ها آپدیت شده‌اند (قیمت‌گذاری)
    if (updates.items) {
      // حذف آیتم‌های قبلی و درج مجدد
      db.prepare("DELETE FROM items WHERE request_id = ?").run(id);
      const insertItem = db.prepare(`
        INSERT INTO items (id, request_id, description, quantity, unit, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const item of updates.items) {
        insertItem.run(
          item.id || uuidv4(),
          id,
          item.description,
          item.quantity,
          item.unit,
          item.unitPrice ?? null,
          item.totalPrice ?? null
        );
      }
    }
  });

  transaction();

  return getRequestById(id);
}

// ========== مدیریت ادمین ==========

export function getAdmin(): { username: string; passwordHash: string } | null {
  const row = db.prepare("SELECT username, password_hash FROM admin WHERE id = 1").get() as any;
  if (!row) return null;
  return { username: row.username, passwordHash: row.password_hash };
}

export function verifyAdmin(username: string, password: string): boolean {
  const admin = getAdmin();
  if (!admin || admin.username !== username) return false;
  return bcrypt.compareSync(password, admin.passwordHash);
}

export function updateAdminPassword(newPasswordHash: string): void {
  db.prepare("UPDATE admin SET password_hash = ? WHERE id = 1").run(newPasswordHash);
}

export default db;
