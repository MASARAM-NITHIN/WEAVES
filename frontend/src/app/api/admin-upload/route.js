import { NextResponse } from 'next/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB input cap

// Upload endpoint that keeps everything inside the database: it returns the
// file as a Base64 data-URI which callers persist in the TEXT image columns.
// Nothing is written to disk, so uploads survive restarts/redeploys and are
// covered by plain database backups.
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: 'File exceeds 10MB limit' }, { status: 413 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mime = file.type || 'image/jpeg';
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (error) {
    console.error('Next.js direct upload error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
