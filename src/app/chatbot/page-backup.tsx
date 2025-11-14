'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Bot, User, Phone, Mail, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
  type?: 'chat' | 'admin-contact';
}

interface AdminContact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: Date;
  status: 'pending' | 'replied' | 'resolved';
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🌟 Welcome to MANAV SAMPADA HR Assistant! I'm here to help you with HRMS queries, login issues, and HR support. What can I assist you with today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "🔐 I forgot my password",
        "❓ How do I access my profile?", 
        "📊 View my salary slips",
        "📞 Contact Admin Support"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminContact, setShowAdminContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        text: "I'm sorry, I'm having trouble responding right now. Please try again later or contact your system administrator.",
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
    if (suggestion.includes('Contact Admin Support')) {
      setShowAdminContact(true);
    } else {
      sendMessage(suggestion);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    setContactStatus('sending');

    try {
      const response = await fetch('/api/admin-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          timestamp: new Date().toISOString(),
          status: 'pending'
        })
      });

      const data = await response.json();

      if (data.success) {
        setContactStatus('sent');
        setContactForm({ name: '', email: '', subject: '', message: '' });

        // Add confirmation message to chat
        const confirmMessage: Message = {
          id: Date.now().toString(),
          text: `✅ Your message has been sent to the admin team! Reference ID: ${data.referenceId}. You can expect a response within 24 hours.`,
          isUser: false,
          timestamp: new Date(),
          type: 'admin-contact'
        };
        setMessages(prev => [...prev, confirmMessage]);

        setTimeout(() => {
          setShowAdminContact(false);
          setContactStatus('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
      setContactStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header with Government Branding */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/1.jpeg"
                alt="Government of Uttar Pradesh Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div className="text-left">
                <h1 className="text-xl font-bold text-blue-900">
                  मानव संपदा उत्तर प्रदेश
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  HR Assistant - Get Help & Support
                </p>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col shadow-xl border-2 border-gray-100">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-medium">HR Assistant</h3>
                <p className="text-blue-100 text-sm">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                  message.isUser 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-12' 
                    : 'bg-white text-gray-900 mr-12 border border-gray-200'
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
                      <p className="text-xs text-gray-500">Suggestions:</p>
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
                  placeholder="Type your question here..."
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
            
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-500">
                💡 Try asking: "How do I login?", "What's my salary?", or "Show my profile"
              </p>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <div className="mt-8">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">What can I help you with?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">General Help</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Login assistance</li>
                    <li>• Password reset</li>
                    <li>• System navigation</li>
                    <li>• Contact information</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">For Logged-in Users</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Salary information</li>
                    <li>• Profile details</li>
                    <li>• Salary slip downloads</li>
                    <li>• Job responsibilities</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need more help? Contact your system administrator or HR department.
          </p>
        </div>
      </div>
    </div>
  );
}
