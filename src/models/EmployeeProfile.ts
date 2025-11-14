import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeProfile extends Document {
  userId: mongoose.Types.ObjectId;
  basicSalary: number;
  allowances: number;
  deductions: number;
  role: string;
  responsibilities: string;
  grade: string;
  employmentType: string;
  status: 'Active' | 'Left';
  joiningDate: Date;
  lastPromotionDate?: Date;
  promotionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    allowances: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    deductions: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    responsibilities: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      required: true,
      trim: true,
    },
    employmentType: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Left'],
      required: true,
      default: 'Active',
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    lastPromotionDate: {
      type: Date,
    },
    promotionNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
EmployeeProfileSchema.index({ userId: 1 });
EmployeeProfileSchema.index({ status: 1 });

export default mongoose.models.EmployeeProfile || 
  mongoose.model<IEmployeeProfile>('EmployeeProfile', EmployeeProfileSchema);
