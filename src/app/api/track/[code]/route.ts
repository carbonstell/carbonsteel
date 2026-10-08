import { NextRequest, NextResponse } from "next/server";
import { getRequestByTrackingCode } from "@/lib/storage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const request = getRequestByTrackingCode(code);

  if (!request) {
    return NextResponse.json(
      { error: "کد پیگیری یافت نشد" },
      { status: 404 }
    );
  }

  // فقط اطلاعات لازم برای مشتری برگردانده شود
  return NextResponse.json({
    trackingCode: request.trackingCode,
    status: request.status,
    createdAt: request.createdAt,
    customerName: request.customerName,
    companyName: request.companyName,
    items: request.items.map((i) => ({
      description: i.description,
      quantity: i.quantity,
      unit: i.unit,
      // قیمت فقط اگر quoted شده باشد
      unitPrice: request.status === "quoted" ? i.unitPrice : undefined,
      totalPrice: request.status === "quoted" ? i.totalPrice : undefined,
    })),
    totalAmount: request.status === "quoted" ? request.totalAmount : undefined,
    validityDays: request.validityDays,
    validUntil: request.validUntil,
    quotedAt: request.quotedAt,
    adminNotes: request.status === "quoted" ? request.adminNotes : undefined,
  });
}
