import { z } from 'zod';

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

// User schemas
export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(1, 'Address is required'),
  role: z.enum(['admin', 'employee']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.string().min(1).optional(),
});

// Employee Profile schemas
export const createEmployeeProfileSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  basicSalary: z.number().min(0, 'Basic salary must be non-negative'),
  allowances: z.number().min(0, 'Allowances must be non-negative').default(0),
  deductions: z.number().min(0, 'Deductions must be non-negative').default(0),
  role: z.string().min(1, 'Role is required'),
  responsibilities: z.string().min(1, 'Responsibilities are required'),
  grade: z.string().min(1, 'Grade is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  status: z.enum(['Active', 'Left']).default('Active'),
  joiningDate: z.string().min(1, 'Joining date is required').transform((str) => new Date(str)),
  lastPromotionDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  promotionNotes: z.string().optional(),
});

export const updateEmployeeProfileSchema = z.object({
  basicSalary: z.number().min(0).optional(),
  allowances: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  role: z.string().min(1).optional(),
  responsibilities: z.string().min(1).optional(),
  grade: z.string().min(1).optional(),
  employmentType: z.string().min(1).optional(),
  status: z.enum(['Active', 'Left']).optional(),
  joiningDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  lastPromotionDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  promotionNotes: z.string().optional(),
});

// Payroll schemas
export const generatePayrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  month: z.number().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().min(2000, 'Year must be 2000 or later'),
  basicSalary: z.number().min(0, 'Basic salary must be non-negative'),
  allowances: z.number().min(0, 'Allowances must be non-negative').default(0),
  deductions: z.number().min(0, 'Deductions must be non-negative').default(0),
});

// Chatbot schema
export const chatbotSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.object({
    userId: z.string().optional(),
    role: z.enum(['admin', 'employee']).optional(),
  }).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateEmployeeProfileInput = z.infer<typeof createEmployeeProfileSchema>;
export type UpdateEmployeeProfileInput = z.infer<typeof updateEmployeeProfileSchema>;
export type GeneratePayrollInput = z.infer<typeof generatePayrollSchema>;
export type ChatbotInput = z.infer<typeof chatbotSchema>;
