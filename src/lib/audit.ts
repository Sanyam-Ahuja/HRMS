import AuditLog from '@/models/AuditLog';
import { Types } from 'mongoose';

export interface AuditLogData {
  adminId: string;
  action: string;
  targetId: string;
  before?: any;
  after?: any;
}

export async function createAuditLog(data: AuditLogData) {
  try {
    const auditLog = new AuditLog({
      adminId: new Types.ObjectId(data.adminId),
      action: data.action,
      targetId: new Types.ObjectId(data.targetId),
      timestamp: new Date(),
      before: data.before,
      after: data.after,
    });

    await auditLog.save();
    return auditLog;
  } catch (error) {
    console.error('Error creating audit log:', error);
    throw error;
  }
}

export const AUDIT_ACTIONS = {
  CREATE_EMPLOYEE: 'CREATE_EMPLOYEE',
  UPDATE_EMPLOYEE: 'UPDATE_EMPLOYEE',
  DELETE_EMPLOYEE: 'DELETE_EMPLOYEE',
  CREATE_ADMIN: 'CREATE_ADMIN',
  UPDATE_SALARY: 'UPDATE_SALARY',
  GENERATE_PAYROLL: 'GENERATE_PAYROLL',
  PROMOTE_EMPLOYEE: 'PROMOTE_EMPLOYEE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
} as const;
