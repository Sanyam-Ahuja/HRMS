'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Settings,
  MessageSquare,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

const sidebarItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Employees',
    href: '/admin/employees',
    icon: Users,
  },
  {
    label: 'Payroll',
    href: '/admin/payroll',
    icon: DollarSign,
  },
  {
    label: 'Audit Logs',
    href: '/admin/logs',
    icon: FileText,
  },
  {
    label: 'Chatbot',
    href: '/admin/chatbot',
    icon: MessageSquare,
  },
  {
    label: 'Settings',
    href: '/admin/settings/admins',
    icon: Settings,
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">HRMS Admin</h1>
        <p className="text-sm text-gray-300">Management Portal</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (pathname.startsWith(item.href) && item.href !== '/admin/dashboard');
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white border-r-2 border-blue-400'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
