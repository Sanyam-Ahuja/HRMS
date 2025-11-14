'use client';

import { useEffect, useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Users, Filter, Search, ChevronLeft, ChevronRight, Settings, Plus, Minus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Leave {
  id: string;
  employee: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
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

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'manage'>('list');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [managingBalance, setManagingBalance] = useState(false);

  useEffect(() => {
    loadLeaves();
    if (viewMode === 'manage') {
      loadEmployees();
    }
  }, [filter, viewMode]);

  const loadLeaves = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      
      const response = await fetch(`/api/leaves?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaves(data.leaves);
      }
    } catch (error) {
      console.error('Failed to load leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadLeaveBalance = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/leaves/balance?employeeId=${employeeId}`);
      const data = await response.json();
      
      if (data.success) {
        setLeaveBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to load leave balance:', error);
    }
  };

  const updateLeaveAllocation = async (leaveType: string, field: 'total' | 'used', delta: number) => {
    if (!leaveBalance || !selectedEmployee) return;

    const newAllocation = { ...leaveBalance.allocations[leaveType] };
    newAllocation[field] = Math.max(0, newAllocation[field] + delta);
    newAllocation.remaining = newAllocation.total - newAllocation.used;

    setManagingBalance(true);
    try {
      const updatedAllocations = {
        ...leaveBalance.allocations,
        [leaveType]: newAllocation
      };

      const response = await fetch('/api/leaves/balance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          year: leaveBalance.year,
          allocations: updatedAllocations
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadLeaveBalance(selectedEmployee.id); // Refresh balance
      } else {
        alert(data.error || 'Failed to update leave allocation');
      }
    } catch (error) {
      console.error('Failed to update allocation:', error);
      alert('Failed to update leave allocation');
    } finally {
      setManagingBalance(false);
    }
  };

  const handleLeaveAction = async (leaveId: string, action: 'approve' | 'reject') => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? rejectionReason : undefined
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`Leave ${action}d successfully!`);
        setSelectedLeave(null);
        setRejectionReason('');
        loadLeaves(); // Refresh data
      } else {
        alert(data.error || `Failed to ${action} leave`);
      }
    } catch (error) {
      console.error(`Failed to ${action} leave:`, error);
      alert(`Failed to ${action} leave`);
    } finally {
      setProcessing(false);
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
        return <Clock className="w-5 h-5 text-gray-500" />;
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

  const filteredLeaves = leaves.filter(leave =>
    leave.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.employee.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    leave.leaveType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  // Calendar View Logic
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getLeavesForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return leaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      return date >= startDate && date <= endDate && leave.status === 'approved';
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600">Review and manage employee leave applications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'primary' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
          <Button
            variant={viewMode === 'manage' ? 'primary' : 'outline'}
            onClick={() => setViewMode('manage')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Balance
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </Card>
      </div>

      {viewMode === 'list' ? (
        <>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by employee name, type, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Leave Applications List */}
          <Card className="overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading leave applications...</p>
              </div>
            ) : filteredLeaves.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {filteredLeaves.map((leave) => (
                  <div key={leave.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{leave.employee.name}</h3>
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
                            <span className="text-gray-600">Employee:</span>
                            <p className="font-medium">{leave.employee.username}</p>
                          </div>
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
                        </div>

                        <div className="mb-3">
                          <span className="text-sm text-gray-600">Reason:</span>
                          <p className="text-sm text-gray-900 mt-1">{leave.reason}</p>
                        </div>

                        <div className="text-xs text-gray-500">
                          Applied on: {new Date(leave.appliedDate).toLocaleString()}
                        </div>

                        {leave.status === 'approved' && leave.approvedBy && (
                          <div className="text-sm text-green-700 bg-green-50 p-2 rounded mt-2">
                            ✓ Approved by {leave.approvedBy.name} on {leave.approvedDate ? new Date(leave.approvedDate).toLocaleDateString() : 'N/A'}
                          </div>
                        )}

                        {leave.status === 'rejected' && (
                          <div className="text-sm text-red-700 bg-red-50 p-2 rounded mt-2">
                            ✗ Rejected: {leave.rejectionReason || 'No reason provided'}
                          </div>
                        )}
                      </div>
                    </div>

                    {leave.status === 'pending' && (
                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                        <Button
                          onClick={() => handleLeaveAction(leave.id, 'approve')}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={processing}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => setSelectedLeave(leave)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          disabled={processing}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No leave applications found</p>
                <p className="text-sm text-gray-500">Employee leave requests will appear here</p>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Calendar View */
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Leave Calendar</h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigateMonth('prev')}
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-medium min-w-[150px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                onClick={() => navigateMonth('next')}
                size="sm"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendar().map((day, index) => {
              const leavesForDay = day ? getLeavesForDate(day) : [];
              return (
                <div
                  key={index}
                  className={`min-h-[80px] p-2 border border-gray-200 ${
                    day ? 'bg-white hover:bg-gray-50' : 'bg-gray-100'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                      {leavesForDay.slice(0, 2).map((leave, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded mb-1 truncate ${getLeaveTypeColor(leave.leaveType)}`}
                          title={`${leave.employee.name} - ${leave.leaveType}`}
                        >
                          {leave.employee.name}
                        </div>
                      ))}
                      {leavesForDay.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{leavesForDay.length - 2} more
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Legend</h4>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-100 rounded mr-2"></div>
                <span>Sick Leave</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-2"></div>
                <span>Casual Leave</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-100 rounded mr-2"></div>
                <span>Vacation Leave</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-100 rounded mr-2"></div>
                <span>Maternity Leave</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-100 rounded mr-2"></div>
                <span>Emergency Leave</span>
              </div>
            </div>
          </div>
        </Card>
      ) : viewMode === 'manage' ? (
        /* Leave Balance Management */
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Leave Balance Management</h3>
            
            {/* Employee Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find(emp => emp.id === e.target.value);
                  setSelectedEmployee(emp);
                  if (emp) {
                    loadLeaveBalance(emp.id);
                  } else {
                    setLeaveBalance(null);
                  }
                }}
                className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.username})
                  </option>
                ))}
              </select>
            </div>

            {/* Leave Balance Management */}
            {selectedEmployee && leaveBalance && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Managing: {selectedEmployee.name} ({leaveBalance.year})
                  </h4>
                  <p className="text-sm text-blue-700">
                    Use the + and - buttons to increase or decrease leave allocations and usage.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(leaveBalance.allocations).map(([type, allocation]) => {
                    const typeColors: { [key: string]: string } = {
                      sick: 'bg-red-50 border-red-200',
                      casual: 'bg-blue-50 border-blue-200',
                      vacation: 'bg-purple-50 border-purple-200',
                      maternity: 'bg-pink-50 border-pink-200',
                      paternity: 'bg-indigo-50 border-indigo-200',
                      emergency: 'bg-orange-50 border-orange-200'
                    };
                    
                    const colorClass = typeColors[type] || 'bg-gray-50 border-gray-200';
                    
                    return (
                      <div key={type} className={`p-4 rounded-lg border ${colorClass}`}>
                        <h5 className="font-medium text-gray-900 mb-4 capitalize">
                          {type.replace(/([A-Z])/g, ' $1').trim()} Leave
                        </h5>

                        {/* Total Allocation */}
                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Total Allocated</span>
                              <span className="text-lg font-bold text-gray-900">{allocation.total}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLeaveAllocation(type, 'total', -1)}
                                disabled={managingBalance || allocation.total <= 0}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLeaveAllocation(type, 'total', 1)}
                                disabled={managingBalance}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Used Leaves */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Used</span>
                              <span className="text-lg font-bold text-red-600">{allocation.used}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLeaveAllocation(type, 'used', -1)}
                                disabled={managingBalance || allocation.used <= 0}
                                className="w-8 h-8 p-0"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLeaveAllocation(type, 'used', 1)}
                                disabled={managingBalance || allocation.used >= allocation.total}
                                className="w-8 h-8 p-0"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Remaining */}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">Remaining</span>
                              <span className="text-lg font-bold text-green-600">{allocation.remaining}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>
      ) : null}

      {/* Rejection Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Leave Application</h3>
              <p className="text-sm text-gray-600 mb-4">
                You are rejecting the leave application for <strong>{selectedLeave.employee.name}</strong>.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => {
                    setSelectedLeave(null);
                    setRejectionReason('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleLeaveAction(selectedLeave.id, 'reject')}
                  loading={processing}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Reject Leave
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
