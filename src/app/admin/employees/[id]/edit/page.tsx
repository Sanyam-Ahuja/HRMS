'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface EmployeeProfile {
  role: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  joiningDate: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
}

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    joiningDate: '',
    phone: '',
    address: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  useEffect(() => {
    if (employeeId) {
      loadEmployeeData();
    }
  }, [employeeId]);

  const loadEmployeeData = async () => {
    try {
      // Load employee basic info
      const response = await fetch(`/api/employees/${employeeId}`);
      const data = await response.json();

      if (data.success) {
        setEmployee(data.employee);
        setProfile(data.employee.profile);
        
        // Set form data
        setFormData({
          name: data.employee.name || '',
          email: data.employee.email || '',
          role: data.employee.profile?.role || '',
          department: data.employee.profile?.department || '',
          basicSalary: data.employee.profile?.basicSalary || 0,
          allowances: data.employee.profile?.allowances || 0,
          deductions: data.employee.profile?.deductions || 0,
          joiningDate: data.employee.profile?.joiningDate ? 
            new Date(data.employee.profile.joiningDate).toISOString().split('T')[0] : '',
          phone: data.employee.profile?.phone || '',
          address: data.employee.profile?.address || '',
          status: data.employee.profile?.status || 'Active',
        });
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update basic user info
      const userResponse = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      });

      // Update employee profile
      const profileResponse = await fetch(`/api/employees/${employeeId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          department: formData.department,
          basicSalary: formData.basicSalary,
          allowances: formData.allowances,
          deductions: formData.deductions,
          joiningDate: formData.joiningDate,
          phone: formData.phone,
          address: formData.address,
          status: formData.status,
        }),
      });

      const userData = await userResponse.json();
      const profileData = await profileResponse.json();

      if (userData.success && profileData.success) {
        alert('Employee updated successfully!');
        router.push(`/admin/employees/${employeeId}`);
      } else {
        alert('Failed to update employee: ' + (userData.error || profileData.error));
      }
    } catch (error) {
      console.error('Failed to save employee:', error);
      alert('Failed to save employee changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Employee Not Found</h2>
        <p className="text-gray-600 mt-2">The requested employee could not be found.</p>
        <Button onClick={() => router.push('/admin/employees')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/admin/employees/${employeeId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
            <p className="text-gray-600">{employee.name} ({employee.username})</p>
          </div>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Employment Details */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Employment Details</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Input
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  placeholder="Enter role/position"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <Input
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Joining Date
                </label>
                <Input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Salary Information */}
        <Card className="lg:col-span-2">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Salary Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basic Salary (₹)
                </label>
                <Input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => handleInputChange('basicSalary', parseInt(e.target.value) || 0)}
                  placeholder="Enter basic salary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowances (₹)
                </label>
                <Input
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => handleInputChange('allowances', parseInt(e.target.value) || 0)}
                  placeholder="Enter allowances"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deductions (₹)
                </label>
                <Input
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => handleInputChange('deductions', parseInt(e.target.value) || 0)}
                  placeholder="Enter deductions"
                />
              </div>
            </div>
            
            {/* Net Salary Display */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Net Salary:</span>
                <span className="text-lg font-bold text-blue-900">
                  ₹{(formData.basicSalary + formData.allowances - formData.deductions).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
