export interface Order {
  id: string;
  description: string;
  createdDate: string;
  type: string;
  fromOwner: {
    id: string;
    name: string;
  }
  toOwner: {
    id: string;
    name: string;
  }
}

export interface AvailableOrders {
  id: string;
  type: string
  format: string;
  description: string;
}
