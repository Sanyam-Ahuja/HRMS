'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle, FileText, AlertTriangle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Leave {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: string;
  approvedBy?: {
    name: string;
    username: string;
  };
  approvedDate?: string;
  rejectionReason?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'evening';
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

export default function EmployeeLeaves() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
    halfDayPeriod: 'morning'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load leaves
      const leavesResponse = await fetch('/api/leaves');
      const leavesData = await leavesResponse.json();
      
      if (leavesData.success) {
        setLeaves(leavesData.leaves);
      }

      // Load leave balance
      const balanceResponse = await fetch('/api/leaves/balance');
      const balanceData = await balanceResponse.json();
      
      if (balanceData.success) {
        setLeaveBalance(balanceData.balance);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate: string, endDate: string, isHalfDay: boolean): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return isHalfDay ? 0.5 : days;
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) return;

    setApplying(true);
    try {
      const response = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Leave application submitted successfully!');
        setShowApplyForm(false);
        setFormData({
          leaveType: 'casual',
          startDate: '',
          endDate: '',
          reason: '',
          isHalfDay: false,
          halfDayPeriod: 'morning'
        });
        loadData(); // Refresh data
      } else {
        alert(data.error || 'Failed to submit leave application');
      }
    } catch (error) {
      console.error('Failed to apply leave:', error);
      alert('Failed to submit leave application');
    } finally {
      setApplying(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      sick: 'bg-red-100 text-red-800',
      casual: 'bg-blue-100 text-blue-800',
      vacation: 'bg-purple-100 text-purple-800',
      maternity: 'bg-pink-100 text-pink-800',
      paternity: 'bg-indigo-100 text-indigo-800',
      emergency: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
  };

  const totalDays = calculateDays(formData.startDate, formData.endDate, formData.isHalfDay);
  const remainingBalance = leaveBalance?.allocations[formData.leaveType]?.remaining || 0;
  const canApply = totalDays > 0 && totalDays <= remainingBalance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Apply for leave and track your applications</p>
        </div>
        <Button
          onClick={() => setShowApplyForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(leaveBalance.allocations).map(([type, allocation]) => (
            <Card key={type} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(type)}`}>
                  {allocation.remaining} left
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{allocation.total} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-medium">{allocation.used} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-green-600">{allocation.remaining} days</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${(allocation.used / allocation.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Leave Applications */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Leave Applications</h3>
          <p className="text-sm text-gray-600">Track the status of your leave requests</p>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaves...</p>
          </div>
        ) : leaves.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {leaves.map((leave) => (
              <div key={leave.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getLeaveTypeColor(leave.leaveType)}`}>
                        {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span className="ml-1">{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                      </span>
                      {leave.isHalfDay && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          Half Day ({leave.halfDayPeriod})
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-gray-600">Start Date:</span>
                        <p className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">End Date:</span>
                        <p className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Days:</span>
                        <p className="font-medium">{leave.totalDays} days</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Applied On:</span>
                        <p className="font-medium">{new Date(leave.appliedDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Reason:</span>
                      <p className="text-sm text-gray-900 mt-1">{leave.reason}</p>
                    </div>

                    {leave.status === 'approved' && leave.approvedBy && (
                      <div className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        ✓ Approved by {leave.approvedBy.name} on {leave.approvedDate ? new Date(leave.approvedDate).toLocaleDateString() : 'N/A'}
                      </div>
                    )}

                    {leave.status === 'rejected' && (
                      <div className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        ✗ Rejected: {leave.rejectionReason || 'No reason provided'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No leave applications found</p>
            <p className="text-sm text-gray-500">Click "Apply for Leave" to submit your first request</p>
          </div>
        )}
      </Card>

      {/* Apply Leave Modal */}
      {showApplyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Apply for Leave</h3>
                <button
                  onClick={() => setShowApplyForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={formData.leaveType}
                      onChange={(e) => setFormData(prev => ({ ...prev, leaveType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="casual">Casual Leave</option>
                      <option value="sick">Sick Leave</option>
                      <option value="vacation">Vacation Leave</option>
                      <option value="maternity">Maternity Leave</option>
                      <option value="paternity">Paternity Leave</option>
                      <option value="emergency">Emergency Leave</option>
                      <option value="other">Other</option>
                    </select>
                    {leaveBalance && (
                      <p className="text-xs text-gray-500 mt-1">
                        Available: {leaveBalance.allocations[formData.leaveType]?.remaining || 0} days
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isHalfDay}
                        onChange={(e) => setFormData(prev => ({ ...prev, isHalfDay: e.target.checked }))}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Half Day</span>
                    </label>
                    {formData.isHalfDay && (
                      <select
                        value={formData.halfDayPeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, halfDayPeriod: e.target.value as 'morning' | 'evening' }))}
                        className="ml-3 px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                {totalDays > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>Total Leave Days:</span>
                      <span className="font-semibold">{totalDays} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Remaining Balance:</span>
                      <span className={`font-semibold ${canApply ? 'text-green-600' : 'text-red-600'}`}>
                        {remainingBalance} days
                      </span>
                    </div>
                    {!canApply && totalDays > remainingBalance && (
                      <div className="flex items-center mt-2 text-red-600 text-sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Insufficient leave balance
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Provide reason for your leave..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplyForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={applying}
                    disabled={!canApply || !formData.reason.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
