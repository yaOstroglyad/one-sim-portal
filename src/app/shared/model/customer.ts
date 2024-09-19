export enum CustomerType {
  Corporate = 'Corporate',
  Private = 'Private'
}

export interface Customer {
  id: string,
  name: string,
  description: string,
  type: CustomerType
}
