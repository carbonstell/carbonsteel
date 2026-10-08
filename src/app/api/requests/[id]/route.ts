import { NextRequest, NextResponse } from "next/server";
import { getRequestById, updateRequest } from "@/lib/storage";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const request = getRequestById(id);
  if (!request) {
    return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  }
  return NextResponse.json(request);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const {
    items,
    validityDays,
    adminNotes,
    deliveryTime,
    deliveryLocation,
  } = body;

  if (!items || !validityDays) {
    return NextResponse.json(
      { error: "اقلام و مدت اعتبار الزامی است" },
      { status: 400 }
    );
  }

  let totalAmount = 0;
  const pricedItems = items.map((item: any) => {
    const unitPrice = Number(item.unitPrice) || 0;
    const totalPrice = unitPrice * (Number(item.quantity) || 0);
    totalAmount += totalPrice;
    return {
      ...item,
      unitPrice,
      totalPrice,
    };
  });

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + Number(validityDays));

  const updated = updateRequest(id, {
    items: pricedItems,
    validityDays: Number(validityDays),
    validUntil: validUntil.toISOString(),
    totalAmount,
    adminNotes,
    deliveryTime: deliveryTime || "",
    deliveryLocation: deliveryLocation || "",
    status: "quoted",
    quotedAt: new Date().toISOString(),
  });

  if (!updated) {
    return NextResponse.json({ error: "درخواست یافت نشد" }, { status: 404 });
  }

  return NextResponse.json({ success: true, request: updated });
}
