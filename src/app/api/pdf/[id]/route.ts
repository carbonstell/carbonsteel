import { NextRequest, NextResponse } from "next/server";
import { getRequestById, getRequestByTrackingCode } from "@/lib/storage";
import { generateProformaPDF } from "@/lib/pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // اول با id جستجو کن، اگر پیدا نشد با trackingCode
  let request = getRequestById(id);
  if (!request) {
    request = getRequestByTrackingCode(id);
  }

  if (!request) {
    return NextResponse.json({ error: "یافت نشد" }, { status: 404 });
  }

  if (request.status !== "quoted") {
    return NextResponse.json(
      { error: "هنوز پیش‌فاکتور صادر نشده است" },
      { status: 400 }
    );
  }

  try {
    const pdfBuffer = generateProformaPDF(request);

    // تبدیل Buffer به Uint8Array برای رفع خطای تایپ
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="proforma-${request.trackingCode}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "خطا در تولید PDF" },
      { status: 500 }
    );
  }
}