import { NextRequest, NextResponse } from "next/server";
import { addRequest, getRequests } from "@/lib/storage";
import { QuoteItem } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customerName,
      companyName,
      phone,
      email,
      address,
      items,
      notes,
    } = body;

    if (!customerName || !phone || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "نام، تلفن و حداقل یک قلم کالا الزامی است" },
        { status: 400 }
      );
    }

    const formattedItems: QuoteItem[] = items.map((item: any) => ({
      id: uuidv4(),
      description: item.description || "",
      quantity: Number(item.quantity) || 1,
      unit: item.unit || "عدد",
    }));

    const newRequest = addRequest({
      customerName,
      companyName,
      phone,
      email,
      address,
      items: formattedItems,
      notes,
    });

    return NextResponse.json({
      success: true,
      trackingCode: newRequest.trackingCode,
      id: newRequest.id,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "خطا در ثبت درخواست" },
      { status: 500 }
    );
  }
}

// فقط برای ادمین - لیست همه درخواست‌ها
export async function GET() {
  try {
    const requests = getRequests();
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "خطا" }, { status: 500 });
  }
}
