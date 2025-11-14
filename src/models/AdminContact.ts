import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminContact extends Document {
  referenceId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'replied' | 'resolved';
  timestamp: Date;
  reply?: string;
  repliedBy?: string;
  repliedAt?: Date;
}

const AdminContactSchema = new Schema<IAdminContact>({
  referenceId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
    default: 'General Inquiry',
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'resolved'],
    default: 'pending',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  reply: {
    type: String,
  },
  repliedBy: {
    type: String,
  },
  repliedAt: {
    type: Date,
  },
});

// Create indexes for better performance
AdminContactSchema.index({ timestamp: -1 });
AdminContactSchema.index({ status: 1 });
AdminContactSchema.index({ email: 1 });

const AdminContact = mongoose.models.AdminContact || mongoose.model<IAdminContact>('AdminContact', AdminContactSchema);

export default AdminContact;
