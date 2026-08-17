import { NextRequest, NextResponse } from "next/server";
import { getUploadedPdfBuffer, getLocalResumes } from "@/lib/local-storage";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const pdfBuffer = getUploadedPdfBuffer(id);

    if (pdfBuffer) {
      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${id}.pdf"`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    // Fallback: search local JSON records for extracted text to render as an HTML preview
    const data = getLocalResumes();
    const record = data.uploadedResumes.find((r) => r.id === id);

    if (record?.parsedText) {
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${record.fileName || "Resume Preview"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #090d16; color: #f8fafc; padding: 40px; margin: 0; }
    .container { max-width: 800px; margin: 0 auto; background: #0f172a; padding: 40px; border-radius: 20px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
    .header { font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 0; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
    pre { white-space: pre-wrap; font-size: 13px; color: #cbd5e1; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; line-height: 1.7; background: #020617; padding: 24px; border-radius: 12px; border: 1px solid #1e293b; }
    .badge { font-size: 11px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span>📄 ${record.fileName || "Uploaded Resume Document"}</span>
      <span class="badge">${record.targetRole || "Parsed Content"}</span>
    </div>
    <pre>${record.parsedText}</pre>
  </div>
</body>
</html>`;
      return new NextResponse(htmlContent, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      });
    }

    return NextResponse.json({ error: "PDF document not found" }, { status: 404 });
  } catch (err) {
    console.error("GET /api/resumes/pdf error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
