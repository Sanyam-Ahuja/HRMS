'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  DollarSign, 
  FileText, 
  Calendar,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  profile: {
    role: string;
    responsibilities: string;
    grade: string;
    employmentType: string;
    status: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    joiningDate: string;
    lastPromotionDate?: string;
  } | null;
}

interface PayrollSummary {
  totalRecords: number;
  latestSalary: number;
  lastPayrollMonth: string;
}

interface LeaveBalance {
  year: number;
  allocations: {
    [key: string]: {
      total: number;
      used: number;
      remaining: number;
    };
  };
}

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get current user profile
      const profileResponse = await fetch('/api/auth/me');
      const profileData = await profileResponse.json();

      if (profileData.success) {
        // Get detailed employee profile
        const employeeResponse = await fetch(`/api/employees/${profileData.user.id}`);
        const employeeData = await employeeResponse.json();

        if (employeeData.success) {
          setProfile(employeeData.employee);

          // Get payroll summary
          const payrollResponse = await fetch(`/api/payroll/employee/${profileData.user.id}`);
          const payrollData = await payrollResponse.json();

          if (payrollData.success && payrollData.payrolls.length > 0) {
            const latest = payrollData.payrolls[0];
            setPayrollSummary({
              totalRecords: payrollData.payrolls.length,
              latestSalary: latest.finalSalary,
              lastPayrollMonth: `${new Date(latest.year, latest.month - 1).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}`,
            });
          }

          // Get leave balance
          const leaveResponse = await fetch('/api/leaves/balance');
          const leaveData = await leaveResponse.json();

          if (leaveData.success) {
            setLeaveBalance(leaveData.balance);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Unable to load profile data</p>
      </div>
    );
  }

  const netSalary = profile.profile 
    ? profile.profile.basicSalary + profile.profile.allowances - profile.profile.deductions
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {profile.name}!</h1>
        <p className="text-gray-600">Here's your employment overview and recent activity.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Current Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{netSalary.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Per month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Salary Slips</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrollSummary?.totalRecords || 0}
              </p>
              <p className="text-xs text-gray-500">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Last Payroll</p>
              <p className="text-lg font-bold text-gray-900">
                {payrollSummary?.lastPayrollMonth || 'N/A'}
              </p>
              <p className="text-xs text-gray-500">Latest</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Balance Section */}
      {leaveBalance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Leave Balance ({leaveBalance.year})
              </div>
              <Link href="/employee/leaves">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Apply for Leave →
                </button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(leaveBalance.allocations).map(([type, allocation]) => {
                const typeColors: { [key: string]: string } = {
                  sick: 'bg-red-100 text-red-800 border-red-200',
                  casual: 'bg-blue-100 text-blue-800 border-blue-200',
                  vacation: 'bg-purple-100 text-purple-800 border-purple-200',
                  maternity: 'bg-pink-100 text-pink-800 border-pink-200',
                  paternity: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  emergency: 'bg-orange-100 text-orange-800 border-orange-200'
                };
                
                const colorClass = typeColors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
                const progressPercentage = allocation.total > 0 ? (allocation.used / allocation.total) * 100 : 0;
                
                return (
                  <div key={type} className={`p-4 rounded-lg border ${colorClass}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">
                        {type.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <span className="text-sm font-semibold">
                        {allocation.remaining} left
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Used: {allocation.used}</span>
                        <span>Total: {allocation.total}</span>
                      </div>
                      <div className="w-full bg-white bg-opacity-60 rounded-full h-2">
                        <div
                          className="bg-current h-2 rounded-full transition-all opacity-70"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Overview & Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profile.email}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">{profile.phone}</span>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-sm text-gray-600">{profile.address}</span>
            </div>

            <div className="pt-4">
              <Link href="/employee/profile">
                <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                  View Full Profile
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Job Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Job Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.profile ? (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-700">Position</p>
                  <p className="text-gray-900">{profile.profile.role}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Grade</p>
                  <p className="text-gray-900">{profile.profile.grade}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Employment Type</p>
                  <p className="text-gray-900">{profile.profile.employmentType}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    profile.profile.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.profile.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700">Joining Date</p>
                  <p className="text-gray-900">
                    {new Date(profile.profile.joiningDate).toLocaleDateString()}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No job profile information available.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/employee/salary-slips">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">View Salary Slips</div>
                <div className="text-sm text-gray-600">Download and view payroll history</div>
              </div>
            </Link>
            
            <Link href="/employee/profile">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Update Profile</div>
                <div className="text-sm text-gray-600">Edit contact information</div>
              </div>
            </Link>
            
            <Link href="/employee/chatbot">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">HR Assistant</div>
                <div className="text-sm text-gray-600">Get help and support</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
