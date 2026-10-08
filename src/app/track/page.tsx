"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function TrackContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  const fetchStatus = async (trackingCode: string) => {
    if (!trackingCode || trackingCode.length < 6) return;
    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/track/${trackingCode}`);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "یافت نشد");
      }
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchStatus(initialCode);
    }
  }, [initialCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(code);
  };

  const statusLabel: Record<string, string> = {
    pending: "در انتظار بررسی",
    quoted: "قیمت اعلام شده",
    expired: "منقضی شده",
    cancelled: "لغو شده",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    quoted: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-800",
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-lg">
            ← بازگشت
          </Link>
          <span className="text-sm text-slate-300">پیگیری درخواست</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">پیگیری درخواست قیمت</h1>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="کد پیگیری ۶ رقمی"
            className="flex-1 border border-slate-300 rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            dir="ltr"
            maxLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 rounded-xl font-medium disabled:opacity-50"
          >
            {loading ? "..." : "جستجو"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-sm text-slate-500">کد پیگیری</p>
                <p className="text-xl font-bold tracking-widest">{data.trackingCode}</p>
              </div>
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                  statusColor[data.status] || "bg-slate-100"
                }`}
              >
                {statusLabel[data.status] || data.status}
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">نام</p>
                  <p className="font-medium">{data.customerName}</p>
                </div>
                {data.companyName && (
                  <div>
                    <p className="text-slate-500">شرکت</p>
                    <p className="font-medium">{data.companyName}</p>
                  </div>
                )}
                <div>
                  <p className="text-slate-500">تاریخ ثبت</p>
                  <p className="font-medium">
                    {new Date(data.createdAt).toLocaleDateString("fa-IR")}
                  </p>
                </div>
                {data.quotedAt && (
                  <div>
                    <p className="text-slate-500">تاریخ اعلام قیمت</p>
                    <p className="font-medium">
                      {new Date(data.quotedAt).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-slate-500 mb-2">اقلام</p>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="text-right p-3">شرح</th>
                        <th className="text-center p-3">تعداد</th>
                        {data.status === "quoted" && (
                          <>
                            <th className="text-center p-3">قیمت واحد</th>
                            <th className="text-center p-3">جمع</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((item: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="p-3">{item.description}</td>
                          <td className="p-3 text-center">
                            {item.quantity} {item.unit}
                          </td>
                          {data.status === "quoted" && (
                            <>
                              <td className="p-3 text-center" dir="ltr">
                                {item.unitPrice?.toLocaleString() || "-"}
                              </td>
                              <td className="p-3 text-center" dir="ltr">
                                {item.totalPrice?.toLocaleString() || "-"}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {data.status === "quoted" && (
                <>
                  <div className="bg-blue-50 rounded-xl p-4 flex justify-between items-center">
                    <span className="font-medium">جمع کل</span>
                    <span className="text-xl font-bold text-blue-700" dir="ltr">
                      {data.totalAmount?.toLocaleString()} ریال
                    </span>
                  </div>

                  {data.validityDays && (
                    <div className="text-sm text-slate-600">
                      <p>
                        مدت اعتبار پیش‌فاکتور:{" "}
                        <strong>{data.validityDays} روز</strong>
                      </p>
                      {data.validUntil && (
                        <p>
                          معتبر تا:{" "}
                          <strong>
                            {new Date(data.validUntil).toLocaleDateString("fa-IR")}
                          </strong>
                        </p>
                      )}
                    </div>
                  )}

                  {data.adminNotes && (
                    <div className="bg-slate-50 rounded-xl p-4 text-sm">
                      <p className="font-medium mb-1">شرایط و توضیحات:</p>
                      <p className="text-slate-600 whitespace-pre-wrap">
                        {data.adminNotes}
                      </p>
                    </div>
                  )}

                  <a
                    href={`/api/pdf/${data.trackingCode}`}
                    className="block w-full bg-green-600 hover:bg-green-500 text-white text-center font-bold py-3 rounded-xl transition"
                  >
                    دانلود پیش‌فاکتور PDF
                  </a>
                </>
              )}

              {data.status === "pending" && (
                <div className="bg-yellow-50 text-yellow-800 rounded-xl p-4 text-sm text-center">
                  درخواست شما در حال بررسی است. به محض اعلام قیمت از طریق همین صفحه می‌توانید پیش‌فاکتور را دریافت کنید.
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">در حال بارگذاری...</div>}>
      <TrackContent />
    </Suspense>
  );
}
