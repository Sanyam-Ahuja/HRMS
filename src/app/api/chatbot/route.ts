import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import EmployeeProfile from '@/models/EmployeeProfile';
import Payroll from '@/models/Payroll';
import { getUserFromRequest } from '@/lib/auth';
import { chatbotSchema } from '@/lib/validations';
import OpenAI from 'openai';

// Initialize OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
    "X-Title": "HRMS - Human Resource Management System",
  },
});

async function getAIResponse(message: string, userContext: any, userData: any) {
  try {
    const systemPrompt = `You are an HR Assistant for a Human Resource Management System. You help employees and administrators with HR-related queries.

Context:
- User Role: ${userContext?.role || 'guest'}
- User ID: ${userContext?.userId || 'unknown'}
- User Data: ${JSON.stringify(userData, null, 2)}

Guidelines:
- Be helpful and professional
- Provide accurate information based on the user data provided
- If you don't have specific information, direct them to contact HR
- Keep responses concise but informative
- Always maintain privacy and only share information relevant to the asking user

Available actions you can help with:
- Salary information queries
- Profile and job details
- Payroll history
- General HR policies
- Contact information updates (employees can only update phone/address)`;

    const completion = await openai.chat.completions.create({
      model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "anthropic/claude-3-haiku",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "I'm sorry, I couldn't process your request right now.";
  } catch (error) {
    console.error('OpenRouter AI error:', error);
    return null; // Fall back to basic responses
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    
    // Validate input
    const validatedData = chatbotSchema.parse(body);
    const { message, context } = validatedData;

    // Get current user context
    let currentUser = getUserFromRequest(request);
    
    // If context is provided, use it (for admin operations)
    if (context && context.userId && context.role) {
      currentUser = {
        userId: context.userId,
        username: '',
        role: context.role,
      };
    }

    // Collect user data for AI context
    let userData = {};
    
    if (currentUser && currentUser.role === 'employee') {
      try {
        const employee = await User.findById(currentUser.userId);
        const profile = await EmployeeProfile.findOne({ userId: currentUser.userId });
        const latestPayroll = await Payroll.findOne({ employeeId: currentUser.userId })
          .sort({ year: -1, month: -1 });

        userData = {
          employee: employee ? {
            name: employee.name,
            username: employee.username,
            email: employee.email,
            phone: employee.phone,
            address: employee.address,
          } : null,
          profile: profile ? {
            role: profile.role,
            grade: profile.grade,
            basicSalary: profile.basicSalary,
            allowances: profile.allowances,
            deductions: profile.deductions,
            status: profile.status,
            joiningDate: profile.joiningDate,
            responsibilities: profile.responsibilities,
          } : null,
          latestPayroll: latestPayroll ? {
            month: latestPayroll.month,
            year: latestPayroll.year,
            finalSalary: latestPayroll.finalSalary,
          } : null,
        };
      } catch (error) {
        console.error('Error fetching user data for AI:', error);
      }
    }

    // Try AI response first
    const aiResponse = await getAIResponse(message, currentUser, userData);
    if (aiResponse) {
      return NextResponse.json({
        success: true,
        response: aiResponse,
        suggestions: [
          "Tell me about my benefits",
          "How do I update my information?",
          "Show my employment history",
          "Contact HR support"
        ]
      });
    }

    // Fall back to basic chatbot responses
    const messageLC = message.toLowerCase();
    
    // Handle login/authentication help
    if (!currentUser) {
      if (messageLC.includes('login') || messageLC.includes('access') || messageLC.includes('password')) {
        return NextResponse.json({
          success: true,
          response: "To log in to the HRMS system, please use your assigned username and password. If you've forgotten your credentials, please contact your system administrator for assistance.",
          suggestions: [
            "I forgot my password",
            "How do I access the system?",
            "Contact admin"
          ]
        });
      }

      return NextResponse.json({
        success: true,
        response: "Hello! I'm the HR Assistant. To access employee-specific information, please log in first. I can help with general questions about the HRMS system.",
        suggestions: [
          "How to login?",
          "What is HRMS?",
          "Contact information"
        ]
      });
    }

    // Employee-specific responses
    if (currentUser.role === 'employee') {
      const employee = await User.findById(currentUser.userId);
      const profile = await EmployeeProfile.findOne({ userId: currentUser.userId });

      if (messageLC.includes('salary') || messageLC.includes('pay')) {
        if (!profile) {
          return NextResponse.json({
            success: true,
            response: "I couldn't find your salary information. Please contact HR for assistance.",
          });
        }

        const netSalary = profile.basicSalary + profile.allowances - profile.deductions;
        return NextResponse.json({
          success: true,
          response: `Your current salary details:\n• Basic Salary: ₹${profile.basicSalary.toLocaleString()}\n• Allowances: ₹${profile.allowances.toLocaleString()}\n• Deductions: ₹${profile.deductions.toLocaleString()}\n• Net Salary: ₹${netSalary.toLocaleString()}`,
          suggestions: [
            "Show my salary slips",
            "When is payday?",
            "Download salary slip"
          ]
        });
      }

      if (messageLC.includes('profile') || messageLC.includes('job') || messageLC.includes('role')) {
        if (!profile) {
          return NextResponse.json({
            success: true,
            response: "I couldn't find your profile information. Please contact HR.",
          });
        }

        return NextResponse.json({
          success: true,
          response: `Your job profile:\n• Role: ${profile.role}\n• Grade: ${profile.grade}\n• Employment Type: ${profile.employmentType}\n• Status: ${profile.status}\n• Joining Date: ${profile.joiningDate.toLocaleDateString()}\n• Responsibilities: ${profile.responsibilities}`,
          suggestions: [
            "Show my salary",
            "When was my last promotion?",
            "Update my contact info"
          ]
        });
      }

      if (messageLC.includes('promotion') || messageLC.includes('last promotion')) {
        if (!profile || !profile.lastPromotionDate) {
          return NextResponse.json({
            success: true,
            response: "No promotion history found in your records.",
          });
        }

        return NextResponse.json({
          success: true,
          response: `Your last promotion was on ${profile.lastPromotionDate.toLocaleDateString()}.\n${profile.promotionNotes ? `Notes: ${profile.promotionNotes}` : ''}`,
          suggestions: [
            "Show my current role",
            "View salary details",
            "Contact HR"
          ]
        });
      }

      if (messageLC.includes('slip') || messageLC.includes('download')) {
        const latestPayroll = await Payroll.findOne({ employeeId: currentUser.userId })
          .sort({ year: -1, month: -1 });

        if (!latestPayroll) {
          return NextResponse.json({
            success: true,
            response: "No salary slips found. Please contact HR if you believe this is an error.",
          });
        }

        return NextResponse.json({
          success: true,
          response: `Your latest salary slip is for ${new Date(latestPayroll.year, latestPayroll.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. You can view and print it from your dashboard.`,
          suggestions: [
            "View all salary slips",
            "Show current salary",
            "Contact HR"
          ]
        });
      }
    }

    // Admin-specific responses
    if (currentUser.role === 'admin') {
      if (messageLC.includes('employee') && messageLC.includes('count')) {
        const employeeCount = await User.countDocuments({ role: 'employee' });
        const activeEmployees = await EmployeeProfile.countDocuments({ status: 'Active' });
        
        return NextResponse.json({
          success: true,
          response: `Employee Statistics:\n• Total Employees: ${employeeCount}\n• Active Employees: ${activeEmployees}\n• Inactive Employees: ${employeeCount - activeEmployees}`,
          suggestions: [
            "Show recent hires",
            "View payroll summary",
            "Show audit logs"
          ]
        });
      }

      if (messageLC.includes('payroll') && messageLC.includes('this month')) {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const monthlyPayrolls = await Payroll.countDocuments({
          month: currentMonth,
          year: currentYear,
        });

        const totalPayroll = await Payroll.aggregate([
          { $match: { month: currentMonth, year: currentYear } },
          { $group: { _id: null, total: { $sum: '$finalSalary' } } }
        ]);

        const totalAmount = totalPayroll[0]?.total || 0;

        return NextResponse.json({
          success: true,
          response: `Payroll Summary for ${new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:\n• Processed: ${monthlyPayrolls} employees\n• Total Amount: ₹${totalAmount.toLocaleString()}`,
          suggestions: [
            "Generate new payroll",
            "View employee list",
            "Show audit logs"
          ]
        });
      }
    }

    // Default response
    return NextResponse.json({
      success: true,
      response: "I'm here to help! You can ask me about:\n• Your salary and benefits\n• Job profile and responsibilities\n• Salary slips and payroll\n• Promotion history\n• Contact information updates\n\nWhat would you like to know?",
      suggestions: [
        "Show my salary",
        "View my profile", 
        "Download salary slip",
        "Contact information"
      ]
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    
    if (error.name === 'ZodError') {
      console.log('Chatbot validation errors:', error.errors);
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
