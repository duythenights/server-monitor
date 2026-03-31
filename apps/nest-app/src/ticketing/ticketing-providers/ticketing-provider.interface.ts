import { Ticket, TicketCreatePayload } from '../ticketing.types';

export interface ITicketingProvider {
  createTicket(ticket: TicketCreatePayload): Promise<Ticket>;
  getTicket(ticketId: string): Promise<Ticket>;
  updateTicket(
    ticketId: string,
    props: Pick<Ticket, 'title' | 'description' | 'status'>,
  ): Promise<Ticket>;
  deleteTicket(ticketId: string): Promise<void>;
}
