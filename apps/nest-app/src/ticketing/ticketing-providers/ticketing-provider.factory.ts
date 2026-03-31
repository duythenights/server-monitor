import { Injectable } from '@nestjs/common';
import { ServiceNowTicketingProvider } from './services-now-ticketing-provider';
import { ITicketingProvider } from './ticketing-provider.interface';

@Injectable()
export class TicketingProviderFactory {
  createProvider(config: Record<string, any>): ITicketingProvider {
    switch (config.provider) {
      case ServiceNowTicketingProvider.name:
        return new ServiceNowTicketingProvider(config);
      default:
        throw new Error('Invalid ticketing provider');
    }
  }
}
