"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [validityDays, setValidityDays] = useState("7");
  const [adminNotes, setAdminNotes] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [saving, setSaving] = useState(false);

  // تغییر رمز
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      if (res.status === 401 || res.status === 403) {
        setIsLoggedIn(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
        setIsLoggedIn(true);
      }
    } catch {
      setIsLoggedIn(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setIsLoggedIn(true);
      loadRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setRequests([]);
  };

  const openQuote = (req: any) => {
    setSelected({
      ...req,
      items: req.items.map((i: any) => ({
        ...i,
        unitPrice: i.unitPrice || "",
      })),
    });
    setValidityDays(req.validityDays?.toString() || "7");
    setAdminNotes(req.adminNotes || "");
    setDeliveryTime(req.deliveryTime || "");
    setDeliveryLocation(req.deliveryLocation || "");
  };

  const updateItemPrice = (index: number, price: string) => {
    if (!selected) return;
    const newItems = [...selected.items];
    newItems[index].unitPrice = price;
    setSelected({ ...selected, items: newItems });
  };

  const handleSaveQuote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selected.items,
          validityDays: Number(validityDays),
          adminNotes,
          deliveryTime,
          deliveryLocation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");
      setSelected(null);
      loadRequests();
      alert("پیش‌فاکتور با موفقیت صادر شد");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (newPass !== confirmPass) {
      setPassError("رمز جدید و تکرار آن یکسان نیستند");
      return;
    }

    if (newPass.length < 6) {
      setPassError("رمز جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }

    setChangingPass(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: currentPass,
          newPassword: newPass,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطا");

      setPassSuccess("رمز عبور با موفقیت تغییر کرد");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => {
        setShowChangePass(false);
        setPassSuccess("");
      }, 2000);
    } catch (err: any) {
      setPassError(err.message);
    } finally {
      setChangingPass(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">ورود ادمین</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">نام کاربری</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">رمز عبور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                dir="ltr"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "در حال ورود..." : "ورود"}
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-6">
            پیش‌فرض: admin / admin123
          </p>
          <Link href="/" className="block text-center text-sm text-slate-500 mt-4">
            بازگشت به سایت
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="font-bold text-lg">پنل مدیریت درخواست‌ها</h1>
          <div className="flex gap-3 items-center text-sm">
            <button
              onClick={() => setShowChangePass(true)}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              تغییر رمز
            </button>
            <button
              onClick={loadRequests}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded"
            >
              بروزرسانی
            </button>
            <button
              onClick={handleLogout}
              className="text-red-300 hover:text-red-200"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-right p-4">کد</th>
                <th className="text-right p-4">مشتری</th>
                <th className="text-right p-4">تاریخ</th>
                <th className="text-right p-4">وضعیت</th>
                <th className="text-right p-4">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    هنوز درخواستی ثبت نشده است
                  </td>
                </tr>
              )}
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-slate-50">
                  <td className="p-4 font-mono">{req.trackingCode}</td>
                  <td className="p-4">
                    <div>{req.customerName}</div>
                    {req.companyName && (
                      <div className="text-xs text-slate-500">{req.companyName}</div>
                    )}
                  </td>
                  <td className="p-4">
                    {new Date(req.createdAt).toLocaleDateString("fa-IR")}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : req.status === "quoted"
                          ? "bg-green-100 text-green-800"
                          : "bg-slate-100"
                      }`}
                    >
                      {req.status === "pending"
                        ? "جدید"
                        : req.status === "quoted"
                        ? "قیمت‌گذاری شده"
                        : req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => openQuote(req)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {req.status === "pending" ? "اعلام قیمت" : "مشاهده / ویرایش"}
                    </button>
                    {req.status === "quoted" && (
                      <a
                        href={`/api/pdf/${req.id}`}
                        className="mr-3 text-green-600 hover:underline text-sm"
                        target="_blank"
                      >
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* مودال اعلام قیمت */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="font-bold text-lg">
                اعلام قیمت - {selected.trackingCode}
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-sm bg-slate-50 p-4 rounded-xl">
                <p>
                  <strong>{selected.customerName}</strong>
                  {selected.companyName && ` - ${selected.companyName}`}
                </p>
                <p className="text-slate-500">{selected.phone}</p>
              </div>

              <div>
                <h3 className="font-medium mb-3">قیمت‌گذاری اقلام</h3>
                <div className="space-y-3">
                  {selected.items.map((item: any, index: number) => (
                    <div
                      key={item.id || index}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-lg"
                    >
                      <div className="col-span-6 text-sm">{item.description}</div>
                      <div className="col-span-2 text-sm text-center">
                        {item.quantity} {item.unit}
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItemPrice(index, e.target.value)}
                          placeholder="قیمت واحد"
                          className="w-full border rounded-lg px-2 py-1.5 text-sm"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    مدت اعتبار (روز) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={validityDays}
                    onChange={(e) => setValidityDays(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    مدت زمان تحویل
                  </label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="مثال: ۷ تا ۱۰ روز کاری"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  محل تحویل
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="مثال: درب کارخانه / محل پروژه مشتری"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  شرایط و توضیحات (اختیاری)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="شرایط پرداخت و سایر توضیحات..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveQuote}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50"
                >
                  {saving ? "در حال ذخیره..." : "صدور پیش‌فاکتور"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-6 py-3 border rounded-xl hover:bg-slate-50"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال تغییر رمز */}
      {showChangePass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-lg">تغییر رمز عبور</h2>
              <button
                onClick={() => {
                  setShowChangePass(false);
                  setPassError("");
                  setPassSuccess("");
                }}
                className="text-slate-400 hover:text-slate-600 text-xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">رمز فعلی</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">رمز جدید</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">تکرار رمز جدید</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  dir="ltr"
                  required
                />
              </div>

              {passError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {passError}
                </div>
              )}
              {passSuccess && (
                <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                  {passSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={changingPass}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 disabled:opacity-50"
              >
                {changingPass ? "در حال ذخیره..." : "تغییر رمز عبور"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
