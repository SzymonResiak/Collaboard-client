import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  req: NextRequest,
  context: { params: { name: string } }
) {
  try {
    const name = context.params.name;
    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    if (!name) {
      return NextResponse.json(
        { error: 'Nazwa tablicy jest wymagana' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/boards/name/${encodeURIComponent(
        name
      )}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token.value}` : '',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Nie udało się pobrać szczegółów tablicy' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Wystąpił błąd podczas pobierania tablicy' },
      { status: 500 }
    );
  }
}
