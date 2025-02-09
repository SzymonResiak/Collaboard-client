import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const params = await context.params;
    const name = decodeURIComponent(params.name);
    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/boards/name/${encodeURIComponent(
        name
      )}`,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch board details' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: 'An error occurred while fetching the board' },
      { status: 500 }
    );
  }
}
