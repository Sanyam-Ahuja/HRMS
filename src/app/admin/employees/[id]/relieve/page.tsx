'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, UserX, Calendar, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Employee {
  id: string;
  name: string;
  username: string;
  email: string;
  isRelieved: boolean;
  relievingDate?: string;
  relievingReason?: string;
  relievedBy?: {
    name: string;
    username: string;
  };
}

export default function RelieveEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    relievingReason: '',
    relievingDate: new Date().toISOString().split('T')[0]
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
        
        // Load relieving details if employee exists
        const relievingResponse = await fetch(`/api/employees/${employeeId}/relieve`);
        const relievingData = await relievingResponse.json();
        
        if (relievingData.success) {
          const empData = relievingData.employee;
          setEmployee(prev => prev ? {
            ...prev,
            isRelieved: empData.isRelieved,
            relievingDate: empData.relievingDate,
            relievingReason: empData.relievingReason,
            relievedBy: empData.relievedBy
          } : empData);
        }
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRelieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.relievingReason.trim()) {
      alert('Please provide a relieving reason');
      return;
    }

    if (!confirm(`Are you sure you want to relieve ${employee?.name}? This action will exclude them from payroll and employee counts.`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/employees/${employeeId}/relieve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Employee relieved successfully!');
        router.push(`/admin/employees/${employeeId}`);
      } else {
        alert(data.error || 'Failed to relieve employee');
      }
    } catch (error) {
      console.error('Failed to relieve employee:', error);
      alert('Failed to relieve employee');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejoin = async () => {
    if (!confirm(`Are you sure you want to rejoin ${employee?.name}? This will make them active again in payroll and employee counts.`)) {
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/employees/${employeeId}/relieve`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Employee rejoined successfully!');
        loadEmployeeData(); // Refresh data
      } else {
        alert(data.error || 'Failed to rejoin employee');
      }
    } catch (error) {
      console.error('Failed to rejoin employee:', error);
      alert('Failed to rejoin employee');
    } finally {
      setProcessing(false);
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
            <h1 className="text-2xl font-bold text-gray-900">
              {employee.isRelieved ? 'Relieved Employee' : 'Relieve Employee'}
            </h1>
            <p className="text-gray-600">{employee.name} ({employee.username})</p>
          </div>
        </div>
        
        {employee.isRelieved && (
          <Button
            onClick={handleRejoin}
            disabled={processing}
            className="bg-green-600 hover:bg-green-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Rejoin Employee
          </Button>
        )}
      </div>

      {/* Employee Status */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            employee.isRelieved ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {employee.isRelieved ? (
              <UserX className="w-6 h-6 text-red-600" />
            ) : (
              <Calendar className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Employee Status: {employee.isRelieved ? 'Relieved' : 'Active'}
            </h3>
            <p className="text-gray-600">
              {employee.isRelieved 
                ? 'This employee has been relieved from their duties'
                : 'This employee is currently active'
              }
            </p>
          </div>
        </div>

        {employee.isRelieved ? (
          /* Show Relieving Details */
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-red-900 mb-4">Relieving Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Relieving Date
                </label>
                <p className="text-sm text-red-900">
                  {employee.relievingDate 
                    ? new Date(employee.relievingDate).toLocaleDateString()
                    : 'Not specified'
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-red-700 mb-1">
                  Relieved By
                </label>
                <p className="text-sm text-red-900">
                  {employee.relievedBy 
                    ? `${employee.relievedBy.name} (${employee.relievedBy.username})`
                    : 'Unknown'
                  }
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-red-700 mb-1">
                Relieving Reason
              </label>
              <p className="text-sm text-red-900 bg-red-100 p-3 rounded border">
                {employee.relievingReason || 'No reason provided'}
              </p>
            </div>
          </div>
        ) : (
          /* Show Relieving Form */
          <form onSubmit={handleRelieve} className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Important Notice</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Relieving an employee will:
                  </p>
                  <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
                    <li>Exclude them from payroll calculations</li>
                    <li>Remove them from active employee counts</li>
                    <li>Preserve their data for record-keeping</li>
                    <li>Prevent them from logging into the system</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relieving Date
                </label>
                <Input
                  type="date"
                  value={formData.relievingDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, relievingDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relieving Reason *
              </label>
              <textarea
                value={formData.relievingReason}
                onChange={(e) => setFormData(prev => ({ ...prev, relievingReason: e.target.value }))}
                placeholder="Please provide a detailed reason for relieving this employee..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/employees/${employeeId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={processing}
                disabled={!formData.relievingReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <UserX className="w-4 h-4 mr-2" />
                Relieve Employee
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Additional Information */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <p className="text-sm text-gray-900">{employee.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <p className="text-sm text-gray-900">{employee.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-sm text-gray-900">{employee.email}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
