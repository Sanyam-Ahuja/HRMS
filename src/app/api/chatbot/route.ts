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

    // Enhanced chatbot responses with HRMS knowledge
    const messageLC = message.toLowerCase();
    
    // HRMS System Knowledge Base
    const hrmsKnowledge = {
      login: {
        keywords: ['login', 'access', 'password', 'signin', 'username', 'credentials', 'forgot password'],
        response: "🔐 **Login Help for MANAV SAMPADA HRMS:**\n\n• **URL:** Access the system through your organization's HRMS portal\n• **Default Admin:** username=admin, password=admin123\n• **Employee Login:** Use your assigned employee ID as username\n• **Forgot Password:** Contact your system administrator\n• **Login Issues:** Clear browser cache and try again\n\n**Features after login:**\n✅ Employee Dashboard\n✅ Leave Management\n✅ Salary Slips\n✅ Profile Management",
        suggestions: ["Reset my password", "What's my username?", "Login not working", "Contact admin support"]
      },
      
      leaves: {
        keywords: ['leave', 'vacation', 'sick', 'casual', 'holiday', 'time off', 'absence', 'apply leave'],
        response: "📅 **Leave Management System:**\n\n**For Employees:**\n• **Apply Leaves:** Go to Leave Management → Apply for Leave\n• **Leave Types:** Sick (12 days), Casual (12 days), Vacation (21 days), Maternity (180 days), Paternity (15 days), Emergency (5 days)\n• **Check Balance:** View remaining leaves on your dashboard\n• **Track Status:** Monitor approval status in Leave Management\n\n**Leave Process:**\n1️⃣ Select leave type and dates\n2️⃣ Provide reason\n3️⃣ Submit for admin approval\n4️⃣ Get notification on approval/rejection\n\n**Half-day leaves supported!**",
        suggestions: ["Apply for leave", "Check leave balance", "Leave types available", "Half day leave"]
      },

      payroll: {
        keywords: ['salary', 'payroll', 'slip', 'payment', 'pay', 'earnings', 'deductions'],
        response: "💰 **Payroll & Salary Information:**\n\n**For Employees:**\n• **View Salary Slips:** Go to Salary Slips section\n• **Download Slips:** PDF format available\n• **Salary Components:** Basic + Allowances - Deductions = Net Salary\n• **Request Payroll:** Use 'Request Payroll' button if not generated\n\n**For Admins:**\n• **Generate Payroll:** Process monthly salaries\n• **Bulk Generation:** Generate for all employees\n• **Individual Payroll:** Generate for specific employees\n• **Payroll History:** View all generated records\n\n**Payment Schedule:** Monthly basis",
        suggestions: ["Download salary slip", "Request payroll", "Salary components", "Payment schedule"]
      },

      profile: {
        keywords: ['profile', 'personal', 'information', 'details', 'update', 'edit', 'contact'],
        response: "👤 **Profile Management:**\n\n**Employee Profile includes:**\n• Personal Information (Name, Email, Phone, Address)\n• Job Details (Role, Department, Grade, Status)\n• Employment Information (Joining Date, Salary Details)\n• Leave Balances\n\n**How to Update:**\n1️⃣ Go to Profile section\n2️⃣ Click 'Edit Profile' or 'Update Profile'\n3️⃣ Make changes to allowed fields\n4️⃣ Save changes\n\n**Admin Changes:**\nContact admin for role, salary, or status changes",
        suggestions: ["Edit my profile", "Update contact info", "Change password", "Job information"]
      },

      admin: {
        keywords: ['admin', 'administrator', 'manage', 'administration', 'control panel'],
        response: "⚙️ **Admin Features (Admin Only):**\n\n**Employee Management:**\n• Add/Edit/View Employees\n• Employee Relieving (soft delete)\n• Profile Management\n\n**Leave Management:**\n• Approve/Reject Leave Applications\n• Manage Leave Balances\n• Calendar View of Leaves\n• Leave Statistics\n\n**Payroll Management:**\n• Generate Monthly Payroll\n• View Payroll History\n• Individual Salary Processing\n\n**System Management:**\n• Audit Logs\n• Support Messages\n• Admin Settings",
        suggestions: ["Employee management", "Leave approvals", "Payroll generation", "System settings"]
      },

      features: {
        keywords: ['features', 'what can', 'capabilities', 'functions', 'modules', 'services'],
        response: "🌟 **MANAV SAMPADA HRMS Features:**\n\n**📊 Dashboard:** Overview of your employment details\n**👥 Employee Management:** Complete profile management\n**📅 Leave Management:** Apply, track, and manage leaves\n**💰 Payroll System:** Salary processing and slip generation\n**📋 Audit Logs:** Track all system activities\n**🤖 HR Assistant:** 24/7 AI support (me!)\n**📞 Admin Contact:** Direct communication with administrators\n\n**🏛️ Government Features:**\n• UP Government compliant\n• Digital service book\n• Promotion management\n• Transfer management\n• Service record maintenance",
        suggestions: ["Leave management", "Payroll system", "Employee features", "Admin features"]
      },

      support: {
        keywords: ['help', 'support', 'problem', 'issue', 'contact', 'assistance', 'trouble'],
        response: "🆘 **Getting Help & Support:**\n\n**Immediate Help:**\n• Use this chatbot for instant answers\n• Check FAQ sections in each module\n• Look for help tooltips (ℹ️ icons)\n\n**Contact Admin:**\n• Use 'Contact Admin' button in chatbot\n• Fill out support form with your issue\n• Get tracking reference number\n• Expect response within 24 hours\n\n**Common Issues:**\n• Login problems → Clear cache, check credentials\n• Leave not approved → Check with your manager\n• Salary slip missing → Request payroll generation\n• Profile updates → Contact admin for restricted fields",
        suggestions: ["Contact admin", "Login help", "Leave issues", "Payroll problems"]
      }
    };

    // Handle different user contexts
    if (!currentUser) {
      // For users not logged in - focus on login help
      if (hrmsKnowledge.login.keywords.some(keyword => messageLC.includes(keyword))) {
        return NextResponse.json({
          success: true,
          response: hrmsKnowledge.login.response,
          suggestions: hrmsKnowledge.login.suggestions
        });
      }

      return NextResponse.json({
        success: true,
        response: "🌟 **Welcome to MANAV SAMPADA HRMS!**\n\nI'm your HR Assistant. To access personalized features, please log in first.\n\n**What I can help with:**\n• Login assistance\n• System overview\n• General HR information\n• Contact support\n\nLog in to access leave management, payroll, profile updates, and more!",
        suggestions: ["How to login?", "System features", "Contact admin", "What is HRMS?"]
      });
    }

    // For logged-in users - provide comprehensive help
    const userRole = currentUser.role === 'admin' ? 'Admin' : 'Employee';
    
    // Check which category the message falls into
    for (const [category, data] of Object.entries(hrmsKnowledge)) {
      if (data.keywords.some(keyword => messageLC.includes(keyword))) {
        return NextResponse.json({
          success: true,
          response: `**Hello ${userRole}!** 👋\n\n${data.response}`,
          suggestions: data.suggestions
        });
      }
    }

    // Default contextual response based on user role
    if (currentUser.role === 'admin') {
      return NextResponse.json({
        success: true,
        response: "👨‍💼 **Admin Dashboard Help:**\n\nAs an administrator, you have access to:\n\n• **Employee Management** - Add, edit, view, relieve employees\n• **Leave Management** - Approve leaves, manage balances\n• **Payroll Processing** - Generate salaries, view records\n• **System Monitoring** - Audit logs, support messages\n• **Settings** - Admin management, system configuration\n\nWhat would you like to help with?",
        suggestions: ["Manage employees", "Process payroll", "Approve leaves", "System settings"]
      });
    } else {
      return NextResponse.json({
        success: true,
        response: "👨‍💻 **Employee Portal Help:**\n\nWelcome! Here's what you can do:\n\n• **📊 Dashboard** - View your employment overview\n• **📅 Leave Management** - Apply for leaves, check balances\n• **💰 Salary Slips** - Download payroll documents\n• **👤 Profile** - Update personal information\n• **🆘 Support** - Get help when needed\n\nHow can I assist you today?",
        suggestions: ["Apply for leave", "Check salary slip", "Update profile", "Leave balance"]
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
