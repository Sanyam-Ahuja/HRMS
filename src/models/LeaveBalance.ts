import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaveBalance extends Document {
  employeeId: mongoose.Types.ObjectId;
  year: number;
  allocations: {
    sick: { total: number; used: number; remaining: number };
    casual: { total: number; used: number; remaining: number };
    vacation: { total: number; used: number; remaining: number };
    maternity: { total: number; used: number; remaining: number };
    paternity: { total: number; used: number; remaining: number };
    emergency: { total: number; used: number; remaining: number };
  };
  lastUpdated: Date;
}

const LeaveBalanceSchema = new Schema<ILeaveBalance>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  allocations: {
    sick: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 12 }
    },
    casual: {
      total: { type: Number, default: 12 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 12 }
    },
    vacation: {
      total: { type: Number, default: 21 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 21 }
    },
    maternity: {
      total: { type: Number, default: 180 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 180 }
    },
    paternity: {
      total: { type: Number, default: 15 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 15 }
    },
    emergency: {
      total: { type: Number, default: 5 },
      used: { type: Number, default: 0 },
      remaining: { type: Number, default: 5 }
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure one balance record per employee per year
LeaveBalanceSchema.index({ employeeId: 1, year: 1 }, { unique: true });

const LeaveBalance = mongoose.models.LeaveBalance || mongoose.model<ILeaveBalance>('LeaveBalance', LeaveBalanceSchema);

export default LeaveBalance;
