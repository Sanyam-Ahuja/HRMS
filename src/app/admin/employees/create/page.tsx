'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function CreateEmployeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    user: {
      name: '',
      username: '',
      password: '',
      email: '',
      phone: '',
      address: '',
    },
    profile: {
      basicSalary: '',
      allowances: '',
      deductions: '',
      role: '',
      responsibilities: '',
      grade: '',
      employmentType: '',
      status: 'Active' as 'Active' | 'Left',
      joiningDate: '',
    },
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      user: {
        ...prev.user,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/employees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: formData.user,
          profile: {
            ...formData.profile,
            basicSalary: parseFloat(formData.profile.basicSalary) || 0,
            allowances: parseFloat(formData.profile.allowances) || 0,
            deductions: parseFloat(formData.profile.deductions) || 0,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/employees');
      } else {
        setError(data.error || 'Failed to create employee');
      }
    } catch (err) {
      setError('An error occurred while creating employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600">Create a new employee account and profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.user.name}
                onChange={handleUserChange}
                placeholder="Enter full name"
                required
              />
              
              <Input
                label="Username"
                name="username"
                value={formData.user.username}
                onChange={handleUserChange}
                placeholder="Enter username"
                required
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.user.email}
                onChange={handleUserChange}
                placeholder="Enter email address"
                required
              />
              
              <Input
                label="Phone"
                name="phone"
                value={formData.user.phone}
                onChange={handleUserChange}
                placeholder="Enter phone number"
                required
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.user.password}
                onChange={handleUserChange}
                placeholder="Enter password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.user.address}
                onChange={handleUserChange}
                rows={3}
                className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                placeholder="Enter complete address"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Job Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Job Role"
                name="role"
                value={formData.profile.role}
                onChange={handleProfileChange}
                placeholder="e.g. Software Engineer"
                required
              />
              
              <Input
                label="Grade"
                name="grade"
                value={formData.profile.grade}
                onChange={handleProfileChange}
                placeholder="e.g. L1, L2, Senior"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.profile.employmentType}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  required
                >
                  <option value="">Select Employment Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.profile.status}
                  onChange={handleProfileChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Left">Left</option>
                </select>
              </div>
              
              <Input
                label="Joining Date"
                name="joiningDate"
                type="date"
                value={formData.profile.joiningDate}
                onChange={handleProfileChange}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.profile.responsibilities}
                onChange={handleProfileChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter job responsibilities and duties"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary Information */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Basic Salary (₹)"
                name="basicSalary"
                type="number"
                value={formData.profile.basicSalary}
                onChange={handleProfileChange}
                placeholder="Enter basic salary"
                min="0"
                required
              />
              
              <Input
                label="Allowances (₹)"
                name="allowances"
                type="number"
                value={formData.profile.allowances}
                onChange={handleProfileChange}
                placeholder="Enter allowances"
                min="0"
              />
              
              <Input
                label="Deductions (₹)"
                name="deductions"
                type="number"
                value={formData.profile.deductions}
                onChange={handleProfileChange}
                placeholder="Enter deductions"
                min="0"
              />
            </div>
            
            {formData.profile.basicSalary && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Net Salary Calculation:</div>
                <div className="mt-2 text-lg font-bold text-gray-900">
                  ₹{(
                    parseFloat(formData.profile.basicSalary || '0') + 
                    parseFloat(formData.profile.allowances || '0') - 
                    parseFloat(formData.profile.deductions || '0')
                  ).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Link href="/admin/employees">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" loading={loading}>
            Create Employee
          </Button>
        </div>
      </form>
    </div>
  );
}
