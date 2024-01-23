export class Order {
  id: string;
  client: {
    name: string;
    email: string;
  };
  prodName: string;
  paymentIntent: string;
  amountTotal: number;
  created: number;
}
