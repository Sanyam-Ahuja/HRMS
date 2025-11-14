'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DollarSign, Plus, FileText, Calendar, Users } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Employee {
  id: string;
  name: string;
  username: string;
  profile?: {
    role: string;
    basicSalary: number;
    status: string;
  };
}

interface PayrollRecord {
  id: string;
  employee: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  finalSalary: number;
  createdAt: string;
}

export default function PayrollPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [recentPayrolls, setRecentPayrolls] = useState<PayrollRecord[]>([]);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Refresh data when selectedMonth or selectedYear changes
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      // Load active employees
      const employeesResponse = await fetch('/api/employees?status=Active');
      const employeesData = await employeesResponse.json();
      
      if (employeesData.success) {
        setEmployees(employeesData.employees.filter((emp: Employee) => emp.profile));
      }

      // Load recent payroll records
      const payrollResponse = await fetch('/api/payroll/list?limit=10');
      const payrollData = await payrollResponse.json();
      
      if (payrollData.success) {
        setRecentPayrolls(payrollData.payrolls);
        setGeneratedCount(payrollData.stats.currentMonthGenerated);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600">Process and manage employee salaries</p>
        </div>
      </div>

      {/* Payroll Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <div className="p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">Generated This Month</p>
              <p className="text-2xl font-bold text-gray-900">{generatedCount}</p>
              <p className="text-xs text-gray-500">Salary slips</p>
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900">
              {getMonthName(selectedMonth)} {selectedYear}
            </div>
            <div className="text-sm text-gray-600">Current Period</div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="p-6">
            <FileText className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <div className="text-2xl font-bold text-gray-900">{recentPayrolls.length}</div>
            <div className="text-sm text-gray-600">Generated This Month</div>
          </div>
        </Card>
      </div>

      {/* Month/Year Selection */}
      <Card>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Payroll Period</h3>
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
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
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
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
        </div>
      </Card>

      {/* Employee List for Payroll */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              Employees - {getMonthName(selectedMonth)} {selectedYear}
            </h3>
          </div>

          {employees.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.profile?.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{employee.profile?.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/payroll/${employee.id}?month=${selectedMonth}&year=${selectedYear}`}>
                          <Button size="sm" className="flex items-center space-x-1">
                            <Plus className="w-4 h-4" />
                            <span>Generate</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No active employees found</p>
              <p className="text-sm text-gray-500">Add employees to start processing payroll</p>
            </div>
          )}
        </div>
      </Card>

      {/* Generated Payrolls */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Generated Payrolls</h3>
            <span className="text-sm text-gray-600">{recentPayrolls.length} records</span>
          </div>

          {recentPayrolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Final Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payroll.employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payroll.employee.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getMonthName(payroll.month)} {payroll.year}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{payroll.finalSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payroll.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedPayroll(payroll)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payrolls generated yet</p>
              <p className="text-sm text-gray-500">Generate payroll for employees to see records here</p>
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/employees">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Manage Employees</div>
                <div className="text-sm text-gray-600">Add or edit employee information</div>
              </div>
            </Link>
            
            <Link href="/admin/logs">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View Payroll History</div>
                <div className="text-sm text-gray-600">Check previous payroll records</div>
              </div>
            </Link>
          </div>
        </div>
      </Card>

      {/* Payroll View Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-auto shadow-2xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Salary Slip - {selectedPayroll.employee.name}</h2>
                    <p className="text-sm text-gray-600">
                      {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayroll(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Salary Slip Content */}
              <div className="bg-white border-2 border-gray-300 p-8 rounded-lg">
                {/* Header */}
                <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">SALARY SLIP</h1>
                  <p className="text-gray-600">Human Resource Management System</p>
                  <p className="text-sm text-gray-500 mt-2">
                    For the month of {getMonthName(selectedPayroll.month)} {selectedPayroll.year}
                  </p>
                </div>

                {/* Employee Information */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Employee Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedPayroll.employee.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employee ID:</span>
                        <span className="font-medium">{selectedPayroll.employee.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedPayroll.employee.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Pay Period</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Month:</span>
                        <span className="font-medium">{getMonthName(selectedPayroll.month)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium">{selectedPayroll.year}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Generated:</span>
                        <span className="font-medium">{new Date(selectedPayroll.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Salary Breakdown */}
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Salary Breakdown</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-300">
                          <th className="text-left py-2 font-semibold text-gray-900">Component</th>
                          <th className="text-right py-2 font-semibold text-gray-900">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-gray-700">Basic Salary</td>
                          <td className="py-2 text-right font-medium">{selectedPayroll.basicSalary.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-green-700">Allowances</td>
                          <td className="py-2 text-right font-medium text-green-700">+ {selectedPayroll.allowances.toLocaleString()}</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-2 text-red-700">Deductions</td>
                          <td className="py-2 text-right font-medium text-red-700">- {selectedPayroll.deductions.toLocaleString()}</td>
                        </tr>
                        <tr className="border-t-2 border-gray-400 bg-blue-50">
                          <td className="py-3 font-bold text-gray-900">NET SALARY</td>
                          <td className="py-3 text-right font-bold text-blue-700 text-lg">₹ {selectedPayroll.finalSalary.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Authorized Signature */}
                <div className="mt-8 pt-6 border-t border-gray-300">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-500">
                        This is a computer-generated salary slip and does not require a signature.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Generated on: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="border-t border-gray-400 w-32 mb-2"></div>
                      <p className="text-xs text-gray-600">Authorized Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
