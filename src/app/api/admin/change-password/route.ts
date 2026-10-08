import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAdmin, updateAdminPassword } from "@/lib/storage";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "رمز فعلی و رمز جدید الزامی است" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "رمز جدید باید حداقل ۶ کاراکتر باشد" },
        { status: 400 }
      );
    }

    const admin = getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "ادمین یافت نشد" }, { status: 404 });
    }

    const isValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "رمز فعلی اشتباه است" },
        { status: 400 }
      );
    }

    const newHash = bcrypt.hashSync(newPassword, 10);
    updateAdminPassword(newHash);

    return NextResponse.json({ success: true, message: "رمز عبور با موفقیت تغییر کرد" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطا در تغییر رمز" }, { status: 500 });
  }
}
