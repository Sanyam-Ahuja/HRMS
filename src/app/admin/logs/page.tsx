'use client';

import { useEffect, useState } from 'react';
import { FileText, Calendar, User, Search, Info, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface AuditLog {
  id: string;
  admin: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
  action: string;
  targetId: string;
  timestamp: string;
  before?: any;
  after?: any;
}

interface Pagination {
  current: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  totalRecords: number;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false,
    totalRecords: 0,
  });
  const [filters, setFilters] = useState({
    action: '',
    adminId: '',
    startDate: '',
    endDate: '',
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      
      if (filters.action) params.append('action', filters.action);
      if (filters.adminId) params.append('adminId', filters.adminId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await fetch(`/api/logs?${params}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      } else {
        console.error('Failed to load logs:', data.error);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    loadLogs();
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE_EMPLOYEE': return <Plus className="w-4 h-4 text-green-600" />;
      case 'UPDATE_EMPLOYEE': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'DELETE_EMPLOYEE': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'GENERATE_PAYROLL': return <FileText className="w-4 h-4 text-purple-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionDescription = (log: AuditLog) => {
    const adminName = log.admin.name;
    
    switch (log.action) {
      case 'CREATE_EMPLOYEE':
        const employeeName = log.after?.name || 'New Employee';
        return `${adminName} created employee profile for ${employeeName}`;
      
      case 'UPDATE_EMPLOYEE':
        const updatedName = log.after?.name || log.before?.name || 'Employee';
        return `${adminName} updated profile information for ${updatedName}`;
      
      case 'DELETE_EMPLOYEE':
        const deletedName = log.before?.name || 'Employee';
        return `${adminName} deleted employee ${deletedName}`;
      
      case 'GENERATE_PAYROLL':
        const payrollEmployee = log.after?.employeeName || 'Employee';
        const month = log.after?.month || 'Unknown';
        const year = log.after?.year || 'Unknown';
        return `${adminName} generated payroll for ${payrollEmployee} (${month}/${year})`;
      
      default:
        return `${adminName} performed ${formatAction(log.action).toLowerCase()}`;
    }
  };

  const getActionDetails = (log: AuditLog) => {
    const details = [];
    
    if (log.targetId) {
      details.push(`Target ID: ${log.targetId}`);
    }
    
    if (log.before) {
      details.push(`Previous: ${JSON.stringify(log.before, null, 2).slice(0, 200)}...`);
    }
    
    if (log.after) {
      details.push(`Updated: ${JSON.stringify(log.after, null, 2).slice(0, 200)}...`);
    }
    
    return details.join('\n\n');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">Track all administrative actions and changes</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center p-6">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.totalRecords}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center p-6">
            <div className="bg-green-500 p-3 rounded-full mr-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Actions</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter(log => 
                  new Date(log.timestamp).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center p-6">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(logs.map(log => log.admin.id)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 bg-white text-gray-900 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400"
              >
                <option value="">All Actions</option>
                <option value="CREATE_EMPLOYEE">Create Employee</option>
                <option value="UPDATE_EMPLOYEE">Update Employee</option>
                <option value="DELETE_EMPLOYEE">Delete Employee</option>
                <option value="CREATE_ADMIN">Create Admin</option>
                <option value="UPDATE_SALARY">Update Salary</option>
                <option value="GENERATE_PAYROLL">Generate Payroll</option>
                <option value="PROMOTE_EMPLOYEE">Promote Employee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={handleSearch} className="w-full flex items-center justify-center space-x-2">
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <div className="text-sm text-gray-600">
              Showing {logs.length} of {pagination.totalRecords} records
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading logs...</p>
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.admin.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.admin.username}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(log.action)}
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatAction(log.action)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-900 mb-1">
                              {getActionDescription(log)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                          
                          {/* Hover Button for Technical Details */}
                          <div className="relative group ml-2">
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <Info className="w-4 h-4" />
                            </button>
                            
                            {/* Tooltip with Technical Details */}
                            <div className="absolute right-0 top-6 w-80 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="font-semibold mb-2">Technical Details:</div>
                              <pre className="whitespace-pre-wrap font-mono text-xs overflow-hidden">
                                {getActionDetails(log)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No audit logs found</p>
              <p className="text-sm text-gray-500">Logs will appear here as admins perform actions</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.total > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Page {pagination.current} of {pagination.total}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
