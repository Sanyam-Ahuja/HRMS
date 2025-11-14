'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, FileText, Plus, Edit, Eye, Info } from 'lucide-react';
import Card from '@/components/ui/Card';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalPayroll: number;
  recentActivities: number;
  previousMonthEmployees?: number;
  previousMonthPayroll?: number;
}

interface RecentActivity {
  id: string;
  action: string;
  target: string;
  timestamp: string;
  admin: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalPayroll: 0,
    recentActivities: 0,
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch employees count
      const employeesResponse = await fetch('/api/employees');
      const employeesData = await employeesResponse.json();
      
      const totalEmployees = employeesData.employees?.length || 0;
      const activeEmployees = employeesData.employees?.filter((emp: any) => 
        emp.profile?.status === 'Active' && !emp.isRelieved
      ).length || 0;

      // Fetch recent audit logs
      const logsResponse = await fetch('/api/logs?limit=5');
      const logsData = await logsResponse.json();
      
      const recentActivities = logsData.logs?.map((log: any) => ({
        id: log.id,
        action: log.action,
        target: log.targetId,
        timestamp: new Date(log.timestamp).toLocaleString(),
        admin: log.admin.name,
      })) || [];

      // Calculate current month payroll
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      let totalPayroll = 0;
      
      // Calculate total payroll from employee profiles (current salaries)
      if (employeesData.employees) {
        totalPayroll = employeesData.employees.reduce((total: number, emp: any) => {
          if (emp.profile && emp.profile.status === 'Active' && !emp.isRelieved) {
            const netSalary = emp.profile.basicSalary + emp.profile.allowances - emp.profile.deductions;
            return total + netSalary;
          }
          return total;
        }, 0);
      }

      setStats({
        totalEmployees,
        activeEmployees,
        totalPayroll,
        recentActivities: recentActivities.length,
      });
      
      setActivities(recentActivities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current: number, previous: number): string => {
    if (!previous || previous === 0) return 'New';
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'CREATE_EMPLOYEE': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE_EMPLOYEE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'GENERATE_PAYROLL': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    const adminName = activity.admin || 'Admin';
    
    switch (activity.action) {
      case 'CREATE_EMPLOYEE':
        return `${adminName} created a new employee profile`;
      case 'UPDATE_EMPLOYEE':
        return `${adminName} updated employee information`;
      case 'GENERATE_PAYROLL':
        return `${adminName} generated monthly payroll`;
      default:
        return `${adminName} performed ${activity.action.replace(/_/g, ' ').toLowerCase()}`;
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      bgColor: 'bg-blue-500',
      change: stats.totalEmployees > 0 ? 'Total' : 'No data',
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: TrendingUp,
      bgColor: 'bg-green-500',
      change: stats.activeEmployees > 0 ? 'Working' : 'None',
    },
    {
      title: 'Monthly Payroll',
      value: `₹${stats.totalPayroll.toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-purple-500',
      change: stats.totalPayroll > 0 ? 'Current' : 'No payroll',
    },
    {
      title: 'Recent Activities',
      value: stats.recentActivities,
      icon: FileText,
      bgColor: 'bg-orange-500',
      change: 'Today',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the HRMS Admin Portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600">{stat.change} from last month</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <p className="text-sm text-gray-600">Latest admin actions</p>
          </div>
          
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">No recent activities</p>
                <p className="text-xs text-gray-400">Admin actions will appear here</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-600">Common administrative tasks</p>
          </div>
          
          <div className="space-y-3">
            <a
              href="/admin/employees/create"
              className="block w-full p-3 text-left bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-900">Add New Employee</div>
              <div className="text-sm text-blue-600">Create employee profile and account</div>
            </a>
            
            <a
              href="/admin/payroll"
              className="block w-full p-3 text-left bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-900">Generate Payroll</div>
              <div className="text-sm text-green-600">Process monthly salary payments</div>
            </a>
            
            <a
              href="/admin/settings/admins"
              className="block w-full p-3 text-left bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-900">Add Admin User</div>
              <div className="text-sm text-purple-600">Create new administrator account</div>
            </a>
          </div>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.activeEmployees}</div>
            <div className="text-sm text-gray-600">Active Employees</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{new Date().getFullYear()}</div>
            <div className="text-sm text-gray-600">Current Year</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
