import mongoose, { Document, Schema } from 'mongoose';

export interface ILeave extends Document {
  employeeId: mongoose.Types.ObjectId;
  leaveType: 'sick' | 'casual' | 'vacation' | 'maternity' | 'paternity' | 'emergency' | 'other';
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  appliedDate: Date;
  approvedBy?: mongoose.Types.ObjectId;
  approvedDate?: Date;
  rejectionReason?: string;
  attachments?: string[];
  isHalfDay?: boolean;
  halfDayPeriod?: 'morning' | 'evening';
}

const LeaveSchema = new Schema<ILeave>({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  leaveType: {
    type: String,
    enum: ['sick', 'casual', 'vacation', 'maternity', 'paternity', 'emergency', 'other'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  totalDays: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  approvedDate: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  attachments: [{
    type: String,
  }],
  isHalfDay: {
    type: Boolean,
    default: false,
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'evening'],
  },
});

// Indexes for better performance
LeaveSchema.index({ employeeId: 1, appliedDate: -1 });
LeaveSchema.index({ status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });
LeaveSchema.index({ leaveType: 1 });

const Leave = mongoose.models.Leave || mongoose.model<ILeave>('Leave', LeaveSchema);

export default Leave;
