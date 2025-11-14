'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Save, Calculator } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  profile: {
    role: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    grade: string;
    status: string;
  };
}

export default function GeneratePayrollPage({ 
  params 
}: { 
  params: Promise<{ employeeId: string }> 
}) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
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

      if (data.success) {
        setEmployee(data.employee);
        if (data.employee.profile) {
          setFormData(prev => ({
            ...prev,
            basicSalary: data.employee.profile.basicSalary,
            allowances: data.employee.profile.allowances,
            deductions: data.employee.profile.deductions,
          }));
        }
      } else {
        setError('Employee not found');
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
      setError('Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          month: formData.month,
          year: formData.year,
          basicSalary: formData.basicSalary,
          allowances: formData.allowances,
          deductions: formData.deductions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Payroll generated successfully!');
        router.push('/admin/payroll');
      } else {
        setError(data.error || 'Failed to generate payroll');
      }
    } catch (err) {
      setError('An error occurred while generating payroll');
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'month' || name === 'year' ? parseInt(value) : parseFloat(value) || 0,
    }));
  };

  const finalSalary = formData.basicSalary + formData.allowances - formData.deductions;

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleDateString('en-US', { month: 'long' });
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
        <Link href="/admin/payroll">
          <Button className="mt-4">Back to Payroll</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/admin/payroll">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payroll
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate Payroll</h1>
          <p className="text-gray-600">Create salary slip for {employee.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Employee Information
            </CardTitle>
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
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-gray-900 mt-1">{employee.email}</p>
            </div>

            {employee.profile && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Job Role</label>
                  <p className="text-gray-900 mt-1">{employee.profile.role}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Grade</label>
                  <p className="text-gray-900 mt-1">{employee.profile.grade}</p>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Payroll Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Salary Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {getMonthName(i + 1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <Input
                label="Basic Salary (₹)"
                name="basicSalary"
                type="number"
                value={formData.basicSalary}
                onChange={handleChange}
                min="0"
                required
              />

              <Input
                label="Allowances (₹)"
                name="allowances"
                type="number"
                value={formData.allowances}
                onChange={handleChange}
                min="0"
              />

              <Input
                label="Deductions (₹)"
                name="deductions"
                type="number"
                value={formData.deductions}
                onChange={handleChange}
                min="0"
              />

              {/* Salary Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Salary Calculation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Basic Salary:</span>
                    <span className="font-medium">₹{formData.basicSalary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allowances:</span>
                    <span className="font-medium text-green-600">+₹{formData.allowances.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deductions:</span>
                    <span className="font-medium text-red-600">-₹{formData.deductions.toLocaleString()}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-gray-900">Final Salary:</span>
                    <span className="font-bold text-blue-600">₹{finalSalary.toLocaleString()}</span>
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
                  loading={generating}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Generate Payroll</span>
                </Button>
                <Link href="/admin/payroll">
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
