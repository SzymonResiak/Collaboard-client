import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    const boardResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/boards/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token?.value}`,
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );

    const board = await boardResponse.json();
    const newFavouriteValue = !board.favourite;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/boards/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token?.value}`,
          'Cache-Control': 'no-store, must-revalidate',
        },
        body: JSON.stringify({ favourite: newFavouriteValue }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error || 'Failed to update board as favourite' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating board:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
