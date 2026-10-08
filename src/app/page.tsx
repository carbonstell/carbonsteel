import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* لوگو و نام شرکت */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* پس‌زمینه زرد شفاف برای برجسته کردن لوگو */}
              <div className="absolute inset-0 bg-yellow-400/20 rounded-xl blur-sm scale-110"></div>
              <div className="relative bg-white/10 backdrop-blur-sm border border-yellow-400/50 rounded-xl p-2 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                <Image
                  src="/logo.png"
                  alt="لوگوی شرکت کربن استیل شهباز"
                  width={110}
                  height={60}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-base md:text-lg font-bold leading-tight text-yellow-300">
                شرکت کربن استیل شهباز
              </h1>
              <p className="text-[11px] md:text-xs text-slate-300 mt-0.5 leading-relaxed">
                ارائه‌دهنده لوله و اتصالات ساختمانی و صنعتی
                <br />
                (نفت، گاز، پتروشیمی و بخار)
              </p>
            </div>
          </div>

          {/* منو */}
          <nav className="flex gap-3 md:gap-5 text-sm">
            <Link href="/request" className="hover:text-yellow-300 transition whitespace-nowrap">
              درخواست قیمت
            </Link>
            <Link href="/track" className="hover:text-yellow-300 transition whitespace-nowrap">
              پیگیری
            </Link>
            <Link href="/admin" className="hover:text-yellow-300 transition whitespace-nowrap">
              ادمین
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 md:py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              درخواست قیمت سریع
              <br />
              <span className="text-yellow-400">لوله، اتصالات و شیرآلات صنعتی</span>
            </h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
              مشخصات مورد نیاز خود را ارسال کنید. ما در کوتاه‌ترین زمان پیش‌فاکتور رسمی برای شما صادر می‌کنیم.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/request"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold py-4 px-10 rounded-xl text-lg transition shadow-lg shadow-yellow-900/30"
              >
                ثبت درخواست قیمت
              </Link>
              <Link
                href="/track"
                className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-4 px-10 rounded-xl text-lg transition"
              >
                پیگیری با کد پیگیری
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
                ۱
              </div>
              <h3 className="font-bold text-lg mb-2">ارسال درخواست</h3>
              <p className="text-slate-600 text-sm">
                مشخصات کالا، تعداد و اطلاعات تماس خود را وارد کنید. ثبت‌نام اجباری نیست.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
                ۲
              </div>
              <h3 className="font-bold text-lg mb-2">اعلام قیمت</h3>
              <p className="text-slate-600 text-sm">
                کارشناسان ما درخواست را بررسی و قیمت را همراه با مدت اعتبار اعلام می‌کنند.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-14 h-14 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 font-bold">
                ۳
              </div>
              <h3 className="font-bold text-lg mb-2">دریافت پیش‌فاکتور</h3>
              <p className="text-slate-600 text-sm">
                پیش‌فاکتور رسمی PDF را دانلود کنید و فرآیند خرید را ادامه دهید.
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-12 px-4 bg-slate-100">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8">محصولات و خدمات</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                "لوله کربن استیل",
                "لوله استنلس استیل",
                "اتصالات جوشی و رزوه‌ای",
                "شیرآلات صنعتی",
                "فلنج و گسکت",
                "لوله مانیسمان",
                "شیر سوزنی و کروی",
                "تجهیزات بخار",
              ].map((item) => (
                <div
                  key={item}
                  className="bg-white rounded-xl py-5 px-3 shadow-sm border border-slate-200 text-sm font-medium hover:border-yellow-400 transition"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4 text-center text-sm">
        <p className="font-medium text-yellow-300">شرکت کربن استیل شهباز</p>
        <p className="mt-1">ارائه‌دهنده لوله و اتصالات ساختمانی و صنعتی (نفت، گاز، پتروشیمی و بخار)</p>
        <p className="mt-3 text-xs">© ۱۴۰۴ - تمامی حقوق محفوظ است</p>
      </footer>
    </div>
  );
}
