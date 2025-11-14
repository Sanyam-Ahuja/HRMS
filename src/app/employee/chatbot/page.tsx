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

export default function EmployeeChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your HR Assistant. I can help you with questions about your salary, profile, payroll history, and other HR-related topics. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "What's my current salary?",
        "Show my profile",
        "Download my salary slip",
        "When was my last promotion?"
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
            role: 'employee'
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
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or contact your HR department directly.",
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
          <h1 className="text-2xl font-bold text-gray-900">HR Assistant</h1>
          <p className="text-gray-600">Get help with HR-related questions and tasks</p>
        </div>
        <Link href="/chatbot" target="_blank">
          <Button variant="outline" className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4" />
            <span>Public Portal</span>
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          variant="outline" 
          onClick={() => sendMessage("What's my current salary?")}
          className="p-4 h-auto flex flex-col items-center space-y-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">My Salary</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => sendMessage("Show my profile")}
          className="p-4 h-auto flex flex-col items-center space-y-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">My Profile</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => sendMessage("Download my latest salary slip")}
          className="p-4 h-auto flex flex-col items-center space-y-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">Salary Slip</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => sendMessage("When was my last promotion?")}
          className="p-4 h-auto flex flex-col items-center space-y-2"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-sm">Promotions</span>
        </Button>
      </div>

      {/* Chat Container */}
      <Card className="h-[600px] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.isUser ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">Try asking:</p>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left px-3 py-2 text-xs bg-white text-gray-700 rounded border hover:bg-gray-50 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-4">
            <div className="flex-1">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about your salary, profile, or any HR question..."
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!inputText.trim() || loading}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </form>
        </div>
      </Card>

      {/* Help Section */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What can I help you with?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Personal Information</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• View your current salary breakdown</li>
                <li>• Check your job profile and role</li>
                <li>• See your employment details</li>
                <li>• View contact information</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Payroll & Documents</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Download salary slips</li>
                <li>• Check payroll history</li>
                <li>• View promotion records</li>
                <li>• Get help with HR policies</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
