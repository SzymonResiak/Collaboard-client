import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/groups`, {
      headers: {
        Authorization: token ? `Bearer ${token.value}` : '',
        'Cache-Control': 'no-store, must-revalidate',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch groups' },
        {
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching groups' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}
