'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, DollarSign, User, Briefcase, TrendingUp } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Employee {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  profile: {
    id: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    role: string;
    responsibilities: string;
    grade: string;
    employmentType: string;
    status: 'Active' | 'Left';
    joiningDate: string;
    lastPromotionDate?: string;
    promotionNotes?: string;
  } | null;
}

export default function EmployeeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string>('');

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEmployeeId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setEmployee(data.employee);
      } else {
        console.error('Employee not found');
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Employee not found</p>
        <Link href="/admin/employees">
          <Button className="mt-4">Back to Employees</Button>
        </Link>
      </div>
    );
  }

  const netSalary = employee.profile 
    ? employee.profile.basicSalary + employee.profile.allowances - employee.profile.deductions
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/admin/employees">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Employees
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
            <p className="text-gray-600">Employee Profile & Details</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link href={`/admin/employees/${employee.id}/edit`}>
            <Button className="flex items-center space-x-2">
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          </Link>
          <Link href={`/admin/payroll/${employee.id}`}>
            <Button variant="secondary" className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4" />
              <span>Generate Payroll</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Employee ID</p>
              <p className="text-lg font-bold text-gray-900">{employee.username}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Net Salary</p>
              <p className="text-lg font-bold text-gray-900">₹{netSalary.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Grade</p>
              <p className="text-lg font-bold text-gray-900">{employee.profile?.grade || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className={`p-3 rounded-full mr-4 ${
              employee.profile?.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-lg font-bold text-gray-900">{employee.profile?.status || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-gray-900 mt-1">{employee.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-gray-900 mt-1">{employee.username}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <p className="text-gray-900 mt-1">{employee.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <p className="text-gray-900 mt-1">{employee.phone}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="text-gray-900 mt-1">{employee.address}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Account Created</label>
              <p className="text-gray-900 mt-1">{new Date(employee.createdAt).toLocaleDateString()}</p>
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
            {employee.profile ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Job Title</label>
                  <p className="text-gray-900 mt-1">{employee.profile.role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Grade</label>
                  <p className="text-gray-900 mt-1">{employee.profile.grade}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Employment Type</label>
                  <p className="text-gray-900 mt-1">{employee.profile.employmentType}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    employee.profile.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {employee.profile.status}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Joining Date</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(employee.profile.joiningDate).toLocaleDateString()}
                  </p>
                </div>

                {employee.profile.lastPromotionDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Promotion</label>
                    <p className="text-gray-900 mt-1">
                      {new Date(employee.profile.lastPromotionDate).toLocaleDateString()}
                    </p>
                    {employee.profile.promotionNotes && (
                      <p className="text-sm text-gray-600 mt-1">{employee.profile.promotionNotes}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500">No job profile information available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salary & Responsibilities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Salary Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employee.profile ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-medium">₹{employee.profile.basicSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-medium text-green-600">+₹{employee.profile.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-medium text-red-600">-₹{employee.profile.deductions.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Net Salary:</span>
                  <span className="font-bold text-blue-600">₹{netSalary.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No salary information available</p>
            )}
          </CardContent>
        </Card>

        {/* Responsibilities */}
        <Card>
          <CardHeader>
            <CardTitle>Job Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.profile?.responsibilities ? (
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">
                  {employee.profile.responsibilities}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No responsibilities defined</p>
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
            <Link href={`/admin/payroll/${employee.id}`}>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Generate Payroll</div>
                <div className="text-sm text-gray-600">Create salary slip for current month</div>
              </div>
            </Link>
            
            <Link href={`/admin/employees/${employee.id}/edit`}>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <Edit className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Edit Profile</div>
                <div className="text-sm text-gray-600">Update employee information</div>
              </div>
            </Link>
            
            <Link href={`/admin/promotions/${employee.id}`}>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-medium text-gray-900">Manage Promotion</div>
                <div className="text-sm text-gray-600">Process promotion or grade change</div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
