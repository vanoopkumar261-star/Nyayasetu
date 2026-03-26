'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, AlertTriangle, Users, LogOut, Loader2, Menu, X, User } from 'lucide-react';

interface SupervisorUser {
  id: string;
  full_name: string;
  role: string;
}

const TOKEN_KEY = 'nyayasetu_token';

export default function SupervisorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SupervisorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { router.push('/login'); return; }

        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.user && data.user.role === 'supervisor') {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    router.push('/login');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: '/supervisor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/supervisor/overdue', label: 'Overdue', icon: AlertTriangle },
    { href: '/supervisor/officers', label: 'Officers', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200
        transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">NyayaSetu</h2>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <span className="text-xs text-purple-600 font-medium">Supervisor Portal</span>
          </div>

          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                <p className="text-xs text-gray-400">Supervisor</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <button
                  key={href}
                  onClick={() => { router.push(href); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-1 text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-900">Supervisor Portal</h1>
        </div>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
