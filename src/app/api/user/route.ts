import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        'Cache-Control': 'no-store, must-revalidate',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch user data' },
        { status: response.status }
      );
    }

    // Poprawmy format odpowiedzi - weźmy pierwszego użytkownika z tablicy
    const user = Array.isArray(data) ? data[0] : data;
    return NextResponse.json(user);
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
