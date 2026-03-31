import { Ticket, TicketCreatePayload, TicketStatus } from '../ticketing.types';
import { ITicketingProvider } from './ticketing-provider.interface';

export class ServiceNowTicketingProvider implements ITicketingProvider {
  constructor(private readonly config: Record<string, any>) {
    // Todo: validate config
  }
  createTicket(ticket: TicketCreatePayload): Promise<Ticket> {
    return Promise.resolve({
      id: 'random-id',
      title: ticket.title,
      description: ticket.description,
      severity: ticket.severity,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  getTicket(ticketId: string): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  updateTicket(
    ticketId: string,
    props: Pick<Ticket, 'title' | 'description' | 'status'>,
  ): Promise<Ticket> {
    throw new Error('Method not implemented.');
  }
  deleteTicket(ticketId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
