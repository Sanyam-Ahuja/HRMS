'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import FloatingChatbot from '@/components/layout/FloatingChatbot';
import { 
  User, 
  FileText, 
  MessageSquare,
  LayoutDashboard,
  LogOut,
  Calendar
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success && data.user.role === 'employee') {
        setUser(data.user);
      } else {
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <Image
                  src="/1.jpeg"
                  alt="Government of Uttar Pradesh Logo"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <h1 className="text-xl font-bold text-gray-900">HRMS Employee</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link
                  href="/employee/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/employee/profile"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                <Link
                  href="/employee/leaves"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Leave Management
                </Link>
                <Link
                  href="/employee/salary-slips"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Salary Slips
                </Link>
                <Link
                  href="/employee/chatbot"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  HR Assistant
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 p-2 rounded-md"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      
      {/* Floating Chatbot */}
      <FloatingChatbot />
    </div>
  );
}
