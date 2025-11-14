'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, MessageSquare, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

export default function AdminChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello Admin! I'm the HR Assistant. I can help you with employee management, payroll queries, and administrative tasks. What would you like to know?",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "Show employee statistics",
        "Get payroll summary",
        "List recent hires",
        "Show system status"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: text,
          context: {
            role: 'admin'
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          isUser: false,
          timestamp: new Date(),
          suggestions: data.suggestions,
        };

        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Assistant (Admin)</h1>
          <p className="text-gray-600">Administrative chatbot for HR management tasks</p>
        </div>
        <Link href="/chatbot" target="_blank">
          <Button variant="outline" className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4" />
            <span>Public Chatbot</span>
          </Button>
        </Link>
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => sendMessage("Show employee statistics")}
          className="group cursor-pointer p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-3 rounded-lg group-hover:bg-blue-700 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Employee Stats</h3>
              <p className="text-sm text-blue-700">View workforce analytics</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => sendMessage("Get payroll summary")}
          className="group cursor-pointer p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-green-600 p-3 rounded-lg group-hover:bg-green-700 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-green-900">Payroll Summary</h3>
              <p className="text-sm text-green-700">Monthly salary overview</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => sendMessage("List recent activities")}
          className="group cursor-pointer p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-purple-600 p-3 rounded-lg group-hover:bg-purple-700 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Recent Activities</h3>
              <p className="text-sm text-purple-700">Latest admin actions</p>
            </div>
          </div>
        </div>
        
        <div 
          onClick={() => sendMessage("Show system status")}
          className="group cursor-pointer p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-orange-600 p-3 rounded-lg group-hover:bg-orange-700 transition-colors">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-orange-900">System Status</h3>
              <p className="text-sm text-orange-700">Health & performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Admin Chat Container */}
      <Card className="h-[650px] flex flex-col shadow-2xl border-2 border-gray-100 bg-gradient-to-b from-white to-gray-50">
        {/* Professional Chat Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 rounded-t-lg border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">AI Admin Assistant</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-slate-300 text-sm">Online • Advanced AI Ready</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-600 bg-opacity-20 rounded-full">
                <span className="text-blue-200 text-xs font-medium">ADMIN MODE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-slate-50 to-white">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
              {/* Admin Avatar for Bot Messages */}
              {!message.isUser && (
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-lg px-5 py-4 rounded-2xl shadow-lg ${
                message.isUser 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white ml-12 border border-blue-500' 
                  : 'bg-white text-gray-800 mr-12 border border-gray-200 shadow-md'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
                
                {/* Enhanced Admin Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium text-slate-600 mb-3">🎯 Suggested Admin Actions:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left px-4 py-3 text-xs bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 rounded-lg border border-slate-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 hover:text-blue-800 transition-all duration-200 font-medium"
                        >
                          ▶ {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-5 py-4 rounded-2xl shadow-md border border-slate-300 max-w-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-400 border-t-slate-800"></div>
                  <div className="space-y-1">
                    <span className="text-sm text-slate-800 font-medium">AI Processing...</span>
                    <div className="text-xs text-slate-600">Analyzing admin request</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Admin Input Area */}
        <div className="border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="💼 Ask about employees, payroll, system status, or admin tasks..."
                disabled={loading}
                className="pl-4 pr-12 py-3 text-gray-800 bg-white border-2 border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 shadow-sm"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-3 h-3 text-slate-600" />
                </div>
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={!inputText.trim() || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <Send className="w-4 h-4" />
              <span>Send Query</span>
            </Button>
          </form>
          
          {/* Admin Input Helper */}
          <div className="mt-3 text-center">
            <p className="text-xs text-slate-500">
              💡 <span className="font-medium">Tip:</span> Try "Show employee count", "Generate payroll report", or "List active users"
            </p>
          </div>
        </div>
      </Card>

      {/* Enhanced Admin Commands Help */}
      <Card className="bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 shadow-lg">
        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-4">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">AI Admin Commands</h3>
              <p className="text-slate-600 text-sm">Advanced admin queries powered by AI</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
                <h4 className="font-bold text-blue-900">Employee Management</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center"><span className="mr-2 text-blue-600">▶</span>"Show employee statistics"</li>
                <li className="flex items-center"><span className="mr-2 text-blue-600">▶</span>"List active employees"</li>
                <li className="flex items-center"><span className="mr-2 text-blue-600">▶</span>"Find employee John"</li>
                <li className="flex items-center"><span className="mr-2 text-blue-600">▶</span>"Recent hire analysis"</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">💰</span>
                </div>
                <h4 className="font-bold text-green-900">Payroll & Finance</h4>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-center"><span className="mr-2 text-green-600">▶</span>"Monthly payroll summary"</li>
                <li className="flex items-center"><span className="mr-2 text-green-600">▶</span>"Generate salary report"</li>
                <li className="flex items-center"><span className="mr-2 text-green-600">▶</span>"Calculate total expenses"</li>
                <li className="flex items-center"><span className="mr-2 text-green-600">▶</span>"Salary breakdown analysis"</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-200">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">⚙️</span>
                </div>
                <h4 className="font-bold text-purple-900">System & Analytics</h4>
              </div>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-center"><span className="mr-2 text-purple-600">▶</span>"System health status"</li>
                <li className="flex items-center"><span className="mr-2 text-purple-600">▶</span>"Recent admin activities"</li>
                <li className="flex items-center"><span className="mr-2 text-purple-600">▶</span>"Database statistics"</li>
                <li className="flex items-center"><span className="mr-2 text-purple-600">▶</span>"Performance metrics"</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-xs font-bold">💡</span>
              </div>
              <div>
                <p className="text-amber-800 font-medium text-sm">Pro Tip:</p>
                <p className="text-amber-700 text-xs">Use natural language! Ask questions like you would to a human assistant.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
