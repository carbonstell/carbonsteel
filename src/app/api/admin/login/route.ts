import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/storage";
import { createAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    const isValid = verifyAdmin(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(username);
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ورود" }, { status: 500 });
  }
}
