import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { name: string } }
) {
  try {
    // Czekamy na params przed użyciem właściwości
    const name = await params.name;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/boards/${name}`
    );
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json<{ error: string }>(
        { error: data.error || 'Failed to fetch board details' },
        { status: response.status }
      );
    }

    return NextResponse.json<any>(data);
  } catch (error: any) {
    // Używamy error w komunikacie błędu, jeśli jest dostępny
    return NextResponse.json<{ error: string }>(
      {
        error: error?.message || 'An error occurred',
      },
      { status: 500 }
    );
  }
}
