import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear all cached data across the whole site
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, message: 'Cache cleared successfully!' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
