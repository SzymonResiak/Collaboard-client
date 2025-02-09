'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [login, setLogin] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const registerResponse = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login,
          password,
          name,
          email,
        }),
      });

      const registerData = await registerResponse.json();

      if (registerResponse.ok) {
        setSuccess('Registration successful');
        setError('');

        const loginResponse = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password }),
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem('accessToken', loginData.accessToken);
          router.push('/boards');
        } else {
          setError(loginData.error || 'Login failed');
        }
      } else {
        setError(registerData.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-center text-2xl font-semibold">
          Create an Account
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username (login)
            </label>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name (First and Last)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email (used as login)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border p-2 focus:border-blue-500 focus:outline-none focus:ring"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700"
          >
            Register
          </button>
        </form>
        {error && (
          <p className="mt-2 text-center text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mt-2 text-center text-sm text-green-600">{success}</p>
        )}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
