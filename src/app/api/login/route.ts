// app/api/register/route.ts

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, password } = await request.json();

    // Here you would add your backend logic for user registration (e.g., saving to a database)
    if (!name || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Simulating successful registration
    return NextResponse.json({ message: 'User registered successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during registration' },
      { status: 500 }
    );
  }
}
