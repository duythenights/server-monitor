export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}
export enum TicketSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface TicketCreatePayload {
  title: string;
  description?: string;
  severity: TicketSeverity;
}
export interface Ticket extends TicketCreatePayload {
  id: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}
