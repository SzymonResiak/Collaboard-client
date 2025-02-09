import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request body:', body);

    const cookieStore = cookies();
    const token = (await cookieStore).get('accessToken');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.value}`,
        'Cache-Control': 'no-store, must-revalidate',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (!response.ok) {
      console.error('API Error:', data);
      return NextResponse.json(
        { error: data.error || 'Failed to create task' },
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
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the task' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}
