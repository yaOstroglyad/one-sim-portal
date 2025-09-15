import { QuickAction } from '../../models';

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'view-tickets',
    title: 'tickets.overview.actions.viewAllTickets',
    description: 'tickets.overview.actions.viewAllTicketsDesc',
    icon: 'cil-list',
    color: 'primary',
    route: '/home/tickets/list'
  },
  {
    id: 'urgent-tickets',
    title: 'tickets.overview.actions.urgentTickets',
    description: 'tickets.overview.actions.urgentTicketsDesc',
    icon: 'cil-warning',
    color: 'danger',
    route: '/home/tickets/list',
    queryParams: { priority: 'URGENT' }
  },
  {
    id: 'my-tickets',
    title: 'tickets.overview.actions.myTickets',
    description: 'tickets.overview.actions.myTicketsDesc',
    icon: 'cil-user',
    color: 'info',
    route: '/home/tickets/list',
    queryParams: { assignedToMe: 'true' }
  }
];

