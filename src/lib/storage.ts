import fs from "fs";
import path from "path";
import { QuoteRequest, AdminUser } from "./types";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const REQUESTS_FILE = path.join(DATA_DIR, "requests.json");
const ADMIN_FILE = path.join(DATA_DIR, "admin.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// خواندن درخواست‌ها
export function getRequests(): QuoteRequest[] {
  ensureDataDir();
  if (!fs.existsSync(REQUESTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(REQUESTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// ذخیره درخواست‌ها (با نوشتن اتمیک برای جلوگیری از خراب شدن فایل)
export function saveRequests(requests: QuoteRequest[]) {
  ensureDataDir();
  const tempFile = REQUESTS_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(requests, null, 2), "utf-8");
  fs.renameSync(tempFile, REQUESTS_FILE);
}

// افزودن درخواست جدید
export function addRequest(
  data: Omit<QuoteRequest, "id" | "trackingCode" | "createdAt" | "updatedAt" | "status">
): QuoteRequest {
  const requests = getRequests();
  const now = new Date().toISOString();
  const trackingCode = Math.floor(100000 + Math.random() * 900000).toString();

  const newRequest: QuoteRequest = {
    id: uuidv4(),
    trackingCode,
    createdAt: now,
    updatedAt: now,
    status: "pending",
    ...data,
  };

  requests.unshift(newRequest);
  saveRequests(requests);
  return newRequest;
}

// پیدا کردن با کد پیگیری
export function getRequestByTrackingCode(code: string): QuoteRequest | null {
  const requests = getRequests();
  return requests.find((r) => r.trackingCode === code) || null;
}

// پیدا کردن با id
export function getRequestById(id: string): QuoteRequest | null {
  const requests = getRequests();
  return requests.find((r) => r.id === id) || null;
}

// به‌روزرسانی درخواست
export function updateRequest(
  id: string,
  updates: Partial<QuoteRequest>
): QuoteRequest | null {
  const requests = getRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return null;

  requests[index] = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveRequests(requests);
  return requests[index];
}

// مدیریت ادمین
export function getAdmin(): AdminUser | null {
  ensureDataDir();
  if (!fs.existsSync(ADMIN_FILE)) {
    const defaultAdmin: AdminUser = {
      username: "admin",
      passwordHash: bcrypt.hashSync("admin123", 10),
    };
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(defaultAdmin, null, 2));
    return defaultAdmin;
  }
  try {
    const data = fs.readFileSync(ADMIN_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function verifyAdmin(username: string, password: string): boolean {
  const admin = getAdmin();
  if (!admin || admin.username !== username) return false;
  return bcrypt.compareSync(password, admin.passwordHash);
}

export function updateAdminPassword(newPasswordHash: string): void {
  ensureDataDir();
  const admin = getAdmin();
  if (!admin) return;
  admin.passwordHash = newPasswordHash;
  fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2));
}
