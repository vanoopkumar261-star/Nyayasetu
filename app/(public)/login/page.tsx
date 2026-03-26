'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Invalid email or password.');
        return;
      }

      // Store token in localStorage
      localStorage.setItem('nyayasetu_token', data.token);
      localStorage.setItem('nyayasetu_user', JSON.stringify(data.user));

      // Redirect based on role
      const role = data.user.role;
      if (role === 'officer') {
        router.push('/officer');
      } else if (role === 'supervisor') {
        router.push('/supervisor');
      } else if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            NyayaSetu Login
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Officer &amp; Supervisor Portal
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 space-y-5"
        >
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="officer@nyayasetu.in"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300
                  outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                  transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300
                  outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                  transition-all text-gray-900 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg
              bg-indigo-600 text-white font-semibold hover:bg-indigo-700
              disabled:opacity-50 disabled:cursor-not-allowed transition-all
              shadow-lg shadow-indigo-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Login
              </>
            )}
          </button>
        </form>

        {/* Citizen Note */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <p className="text-sm text-amber-800">
            <strong>Citizens don&apos;t need login</strong> — file your complaint directly from the home page.
          </p>
        </div>
      </div>
    </div>
  );
}
