"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Item {
  description: string;
  quantity: string;
  unit: string;
}

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ trackingCode: string } | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "1", unit: "عدد" },
  ]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unit: "عدد" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          companyName,
          phone,
          email,
          address,
          notes,
          items: items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خطا در ثبت");
      }

      setSuccess({ trackingCode: data.trackingCode });
    } catch (err: any) {
      setError(err.message || "خطا در ارسال درخواست");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-bold mb-2">درخواست با موفقیت ثبت شد</h2>
          <p className="text-slate-600 mb-6">
            کد پیگیری شما:
          </p>
          <div className="bg-slate-100 rounded-xl py-4 px-6 text-3xl font-bold tracking-widest text-blue-700 mb-6">
            {success.trackingCode}
          </div>
          <p className="text-sm text-slate-500 mb-6">
            این کد را ذخیره کنید. می‌توانید با آن وضعیت درخواست و پیش‌فاکتور را پیگیری کنید.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/track?code=${success.trackingCode}`}
              className="bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-500 transition"
            >
              پیگیری درخواست
            </Link>
            <Link
              href="/"
              className="text-slate-600 hover:text-slate-800 py-2"
            >
              بازگشت به صفحه اصلی
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-4 px-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link href="/" className="font-bold text-lg">
            ← بازگشت
          </Link>
          <span className="text-sm text-slate-300">فرم درخواست قیمت</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-2">ثبت درخواست قیمت</h1>
        <p className="text-slate-600 mb-8 text-sm">
          مشخصات کالا یا تجهیزات مورد نیاز خود را وارد کنید. ثبت‌نام اجباری نیست.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* اطلاعات مشتری */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 border-b pb-2">اطلاعات تماس</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نام و نام خانوادگی *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: علی رضایی"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">نام شرکت</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اختیاری"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">شماره موبایل *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0912xxxxxxx"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ایمیل</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اختیاری"
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">آدرس</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="اختیاری"
                />
              </div>
            </div>
          </section>

          {/* اقلام */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="font-bold text-lg">اقلام درخواستی</h2>
              <button
                type="button"
                onClick={addItem}
                className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100"
              >
                + افزودن قلم
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-end bg-slate-50 p-4 rounded-xl"
                >
                  <div className="col-span-12 md:col-span-6">
                    <label className="block text-xs font-medium mb-1">شرح کالا *</label>
                    <input
                      type="text"
                      required
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: لوله کربن استیل ۴ اینچ SCH40"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="block text-xs font-medium mb-1">تعداد *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dir="ltr"
                    />
                  </div>
                  <div className="col-span-5 md:col-span-3">
                    <label className="block text-xs font-medium mb-1">واحد</label>
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="عدد">عدد</option>
                      <option value="متر">متر</option>
                      <option value="کیلوگرم">کیلوگرم</option>
                      <option value="تن">تن</option>
                      <option value="ست">ست</option>
                      <option value="بسته">بسته</option>
                    </select>
                  </div>
                  <div className="col-span-3 md:col-span-1">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="w-full text-red-500 hover:text-red-700 text-sm py-2"
                      >
                        حذف
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* توضیحات */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <label className="block text-sm font-medium mb-2">توضیحات اضافی</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="استاندارد مورد نیاز، زمان تحویل مورد انتظار، یا هر توضیح دیگری..."
            />
          </section>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-bold py-4 rounded-xl text-lg transition"
          >
            {loading ? "در حال ثبت..." : "ثبت درخواست قیمت"}
          </button>
        </form>
      </main>
    </div>
  );
}
