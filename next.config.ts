import type { NextConfig } from "next";

const nextConfig: NextConfig = {
//  output: 'export', // این خط بسیار حیاتی است برای حل مشکل 404
  images: {
    unoptimized: true, // برای جلوگیری از خطا در هنگام استخراج فایل‌های ایستا (Static)
  },
};

export default nextConfig;
