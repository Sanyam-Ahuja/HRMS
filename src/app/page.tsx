'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-lg">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Image
            src="/1.jpeg"
            alt="Government of Uttar Pradesh Logo"
            width={80}
            height={80}
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to login portal...</p>
      </div>
    </div>
  );
}
