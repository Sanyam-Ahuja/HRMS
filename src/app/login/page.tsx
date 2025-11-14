'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect based on role
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/employee/dashboard');
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Government Branding */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/1.jpeg"
                alt="Government of Uttar Pradesh Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-blue-900">
                  मानव संपदा उत्तर प्रदेश
                </h1>
                <h2 className="text-xl font-semibold text-blue-800">
                  MANAV SAMPADA UTTAR PRADESH
                </h2>
                <p className="text-sm text-gray-600 font-medium">
                  A HRMS Application for Employee Management
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>An e-Governance effort by</p>
              <p className="font-semibold">National Informatics Centre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
          {/* Login Card Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Employee Login Portal
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your employee dashboard and services
            </p>
          </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign in to your account</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />

              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={!formData.username || !formData.password}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-gray-600">
                Need help accessing your account?{' '}
                <a
                  href="/chatbot"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Contact Support
                </a>
              </p>
              <div className="border-t border-gray-200 pt-3">
                <a
                  href="https://ehrms.upsdc.gov.in/AndroidApp/mSTHAPNAUserManual.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Mobile App Manual</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Portal Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Payroll Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Salary Slip Updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Job Profile Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Promotion Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Leave Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>HR Chatbot Support</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Default admin: username=admin, password=admin123
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
