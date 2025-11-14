'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  data?: any;
  error?: string;
}

export default function DebugPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Employee Creation Test', status: 'pending' },
    { name: 'Chatbot Validation Test', status: 'pending' },
    { name: 'API Authentication Test', status: 'pending' },
    { name: 'Database Connection Test', status: 'pending' },
  ]);

  const updateTestResult = (index: number, result: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, ...result } : test
    ));
  };

  const runEmployeeTest = async () => {
    updateTestResult(0, { status: 'pending' });
    
    try {
      const response = await fetch('/api/debug/test-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateTestResult(0, { 
          status: 'success', 
          data: data 
        });
      } else {
        updateTestResult(0, { 
          status: 'error', 
          error: data.error || 'Unknown error',
          data: data
        });
      }
    } catch (error: any) {
      updateTestResult(0, { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const runChatbotTest = async () => {
    updateTestResult(1, { status: 'pending' });
    
    try {
      const response = await fetch('/api/debug/test-chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Test message',
          context: { role: 'admin' }
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateTestResult(1, { 
          status: 'success', 
          data: data 
        });
      } else {
        updateTestResult(1, { 
          status: 'error', 
          error: data.error || 'Unknown error',
          data: data
        });
      }
    } catch (error: any) {
      updateTestResult(1, { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const runAuthTest = async () => {
    updateTestResult(2, { status: 'pending' });
    
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (response.ok && data.success) {
        updateTestResult(2, { 
          status: 'success', 
          data: { user: data.user } 
        });
      } else {
        updateTestResult(2, { 
          status: 'error', 
          error: data.error || 'Auth failed' 
        });
      }
    } catch (error: any) {
      updateTestResult(2, { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const runDbTest = async () => {
    updateTestResult(3, { status: 'pending' });
    
    try {
      const response = await fetch('/api/employees?limit=1');
      const data = await response.json();
      
      if (response.ok) {
        updateTestResult(3, { 
          status: 'success', 
          data: { 
            connected: true, 
            employeeCount: data.employees?.length || 0 
          } 
        });
      } else {
        updateTestResult(3, { 
          status: 'error', 
          error: data.error || 'DB connection failed' 
        });
      }
    } catch (error: any) {
      updateTestResult(3, { 
        status: 'error', 
        error: error.message 
      });
    }
  };

  const runAllTests = async () => {
    await runAuthTest();
    await runDbTest();
    await runChatbotTest();
    await runEmployeeTest();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-yellow-200 bg-yellow-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Debug</h1>
          <p className="text-gray-600">Test and diagnose backend functionality</p>
        </div>
        <Button onClick={runAllTests} className="flex items-center space-x-2">
          <Play className="w-4 h-4" />
          <span>Run All Tests</span>
        </Button>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tests.map((test, index) => (
          <Card key={index} className={`${getStatusColor(test.status)} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  {getStatusIcon(test.status)}
                  <span>{test.name}</span>
                </span>
                <Button
                  size="sm"
                  onClick={() => {
                    switch (index) {
                      case 0: runEmployeeTest(); break;
                      case 1: runChatbotTest(); break;
                      case 2: runAuthTest(); break;
                      case 3: runDbTest(); break;
                    }
                  }}
                >
                  Test
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {test.status === 'pending' && (
                <p className="text-gray-600">Click "Test" to run this diagnostic</p>
              )}
              
              {test.status === 'success' && (
                <div>
                  <p className="text-green-700 font-medium mb-2">✅ Test Passed</p>
                  {test.data && (
                    <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
              
              {test.status === 'error' && (
                <div>
                  <p className="text-red-700 font-medium mb-2">❌ Test Failed</p>
                  <p className="text-red-600 text-sm mb-2">{test.error}</p>
                  {test.data && (
                    <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Manual Test Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual API Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Test Chatbot API</h4>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    fetch('/api/chatbot', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ message: 'Hello' })
                    }).then(r => r.json()).then(console.log).catch(console.error);
                  }}
                >
                  Simple Message
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetch('/api/chatbot', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        message: 'Show employee statistics', 
                        context: { role: 'admin' }
                      })
                    }).then(r => r.json()).then(console.log).catch(console.error);
                  }}
                >
                  Admin Query
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-1">Check browser console for results</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
