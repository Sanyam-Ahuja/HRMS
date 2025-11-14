'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Save } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Employee {
  id: string;
  name: string;
  username: string;
  profile: {
    role: string;
    grade: string;
    basicSalary: number;
    lastPromotionDate?: string;
    promotionNotes?: string;
  };
}

export default function PromotionPage({ 
  params 
}: { 
  params: Promise<{ employeeId: string }> 
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [formData, setFormData] = useState({
    role: '',
    grade: '',
    basicSalary: 0,
    lastPromotionDate: new Date().toISOString().split('T')[0],
    promotionNotes: '',
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setEmployeeId(resolvedParams.employeeId);
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

      if (data.success && data.employee.profile) {
        setEmployee(data.employee);
        setFormData({
          role: data.employee.profile.role,
          grade: data.employee.profile.grade,
          basicSalary: data.employee.profile.basicSalary,
          lastPromotionDate: new Date().toISOString().split('T')[0],
          promotionNotes: '',
        });
      } else {
        setError('Employee not found or no profile available');
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
      setError('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: formData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Promotion processed successfully!');
        router.push(`/admin/employees/${employeeId}`);
      } else {
        setError(data.error || 'Failed to process promotion');
      }
    } catch (err) {
      setError('An error occurred while processing promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' ? parseFloat(value) || 0 : value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error || 'Employee not found'}</p>
        <Link href="/admin/employees">
          <Button className="mt-4">Back to Employees</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/admin/employees/${employeeId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Process Promotion</h1>
          <p className="text-gray-600">Update promotion details for {employee.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Information */}
        <Card>
          <CardHeader>
            <CardTitle>Current Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Employee Name</label>
              <p className="text-gray-900 mt-1">{employee.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Employee ID</label>
              <p className="text-gray-900 mt-1">{employee.username}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Current Role</label>
              <p className="text-gray-900 mt-1">{employee.profile.role}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Current Grade</label>
              <p className="text-gray-900 mt-1">{employee.profile.grade}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Current Salary</label>
              <p className="text-gray-900 mt-1">₹{employee.profile.basicSalary.toLocaleString()}</p>
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
          </CardContent>
        </Card>

        {/* Promotion Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              New Promotion Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Job Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Enter new job role"
                required
              />

              <Input
                label="New Grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                placeholder="Enter new grade (e.g., L2, Senior, Lead)"
                required
              />

              <Input
                label="New Basic Salary (₹)"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleChange}
                min="0"
                required
              />

              <Input
                label="Promotion Date"
                name="lastPromotionDate"
                type="date"
                value={formData.lastPromotionDate}
                onChange={handleChange}
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotion Notes
                </label>
                <textarea
                  name="promotionNotes"
                  value={formData.promotionNotes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                  placeholder="Enter promotion notes, reasons, or additional comments..."
                />
              </div>

              {/* Salary Comparison */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Salary Comparison</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Salary:</span>
                    <span className="font-medium">₹{employee.profile.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Salary:</span>
                    <span className="font-medium text-green-600">₹{formData.basicSalary.toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Increase:</span>
                    <span className={`font-bold ${
                      formData.basicSalary > employee.profile.basicSalary ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.basicSalary > employee.profile.basicSalary ? '+' : ''}
                      ₹{(formData.basicSalary - employee.profile.basicSalary).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button
                  type="submit"
                  loading={saving}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Process Promotion</span>
                </Button>
                <Link href={`/admin/employees/${employeeId}`}>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
