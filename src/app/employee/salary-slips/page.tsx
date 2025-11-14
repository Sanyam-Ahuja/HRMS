'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, Eye, Calendar, Search, Printer } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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

interface SalarySlipModalProps {
  payroll: PayrollRecord | null;
  onClose: () => void;
}

function SalarySlipModal({ payroll, onClose }: SalarySlipModalProps) {
  if (!payroll) return null;

  const handlePrint = () => {
    // Hide the modal buttons and background for printing
    const modalButtons = document.querySelectorAll('.no-print');
    modalButtons.forEach(btn => (btn as HTMLElement).style.display = 'none');
    
    window.print();
    
    // Restore buttons after printing
    setTimeout(() => {
      modalButtons.forEach(btn => (btn as HTMLElement).style.display = '');
    }, 100);
  };

  const handleDownloadPDF = () => {
    // Simple HTML to PDF conversion using browser print
    const printContent = document.getElementById('salary-slip-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Salary Slip - ${payroll.employee.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .flex { display: flex; justify-content: space-between; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .border { border: 1px solid #ddd; padding: 15px; }
                .total { background: #f0f9ff; border: 2px solid #0ea5e9; padding: 15px; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-lg { font-size: 1.125em; }
                .text-sm { font-size: 0.875em; }
                .text-blue { color: #0ea5e9; }
                .text-green { color: #10b981; }
                .text-red { color: #ef4444; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-auto shadow-2xl">
        <div className="p-6">
          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-6 no-print">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Official Salary Slip</h2>
                <p className="text-sm text-gray-600">
                  {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Professional Salary Slip Content */}
          <div id="salary-slip-content" className="bg-white border-2 border-gray-300 p-8 rounded-lg print:shadow-none print:border-0 print:p-0">
            {/* Header */}
            <div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">SALARY SLIP</h1>
              <p className="text-gray-600">Human Resource Management System</p>
              <p className="text-sm text-gray-500 mt-2">
                For the month of {new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            {/* Employee Information */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Employee Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{payroll.employee.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="font-medium">{payroll.employee.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{payroll.employee.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-2">Pay Period</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Month:</span>
                    <span className="font-medium">{new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', { month: 'long' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Year:</span>
                    <span className="font-medium">{payroll.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Generated:</span>
                    <span className="font-medium">{new Date(payroll.createdAt).toLocaleDateString()}</span>
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
                      <td className="py-2 text-right font-medium">{payroll.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-green-700">Allowances</td>
                      <td className="py-2 text-right font-medium text-green-700">+ {payroll.allowances.toLocaleString()}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 text-red-700">Deductions</td>
                      <td className="py-2 text-right font-medium text-red-700">- {payroll.deductions.toLocaleString()}</td>
                    </tr>
                    <tr className="border-t-2 border-gray-400 bg-blue-50">
                      <td className="py-3 font-bold text-gray-900">NET SALARY</td>
                      <td className="py-3 text-right font-bold text-blue-700 text-lg">₹ {payroll.finalSalary.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
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
  );
}

export default function SalarySlipsPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: '',
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadPayrolls();
  }, []);

  const loadPayrolls = async () => {
    try {
      // Get current user
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();

      if (userData.success) {
        setCurrentUser(userData.user);
        
        // Get payroll records
        const params = new URLSearchParams();
        if (filters.year) params.append('year', filters.year);
        if (filters.month) params.append('month', filters.month);

        const response = await fetch(`/api/payroll/employee/${userData.user.id}?${params}`);
        const data = await response.json();

        if (data.success) {
          setPayrolls(data.payrolls);
        }
      }
    } catch (error) {
      console.error('Failed to load payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    loadPayrolls();
  };

  const handleRequestPayroll = async () => {
    if (!currentUser) return;
    
    setRequesting(true);
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const response = await fetch('/api/payroll/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          month: currentMonth,
          year: currentYear,
          message: `Payroll request for ${currentMonth}/${currentYear} by ${currentUser.name}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        // Optionally refresh the payroll list
        loadPayrolls();
      } else {
        alert(data.error || 'Failed to submit payroll request');
      }
      
    } catch (error) {
      console.error('Failed to request payroll:', error);
      alert('Failed to submit payroll request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Slips</h1>
          <p className="text-gray-600">View and download your salary history</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={handleRequestPayroll}
            loading={requesting}
            className="flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Request Current Month</span>
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Slips</p>
              <p className="text-2xl font-bold text-gray-900">{payrolls.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrolls.length > 0 ? getMonthName(payrolls[0].month) : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <Download className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Salary</p>
              <p className="text-2xl font-bold text-gray-900">
                {payrolls.length > 0 ? `₹${payrolls[0].finalSalary.toLocaleString()}` : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              >
                <option value="">All Years</option>
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={filters.month}
                onChange={(e) => setFilters(prev => ({ ...prev, month: e.target.value }))}
                className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              >
                <option value="">All Months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleFilter} className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Slips List */}
      <Card>
        <CardHeader>
          <CardTitle>Salary History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading salary slips...</p>
            </div>
          ) : payrolls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pay Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Basic Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Allowances
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrolls.map((payroll) => (
                    <tr key={payroll.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getMonthName(payroll.month)} {payroll.year}
                          </div>
                          <div className="text-sm text-gray-500">
                            Generated: {new Date(payroll.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{payroll.basicSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +₹{payroll.allowances.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -₹{payroll.deductions.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        ₹{payroll.finalSalary.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPayroll(payroll)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Salary Slips Found</h3>
              <p className="text-gray-600 mb-4">
                {filters.year || filters.month 
                  ? 'No salary slips match your current filters'
                  : 'Your salary slips will appear here once payroll is processed'
                }
              </p>
              {!filters.year && !filters.month && (
                <div className="space-y-4">
                  <Button 
                    onClick={handleRequestPayroll}
                    loading={requesting}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Request Your First Payroll</span>
                  </Button>
                  <p className="text-xs text-gray-500">
                    Click above to request your payroll slip from HR
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salary Slip Modal */}
      <SalarySlipModal 
        payroll={selectedPayroll} 
        onClose={() => setSelectedPayroll(null)} 
      />
    </div>
  );
}
