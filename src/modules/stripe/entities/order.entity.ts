export class Order {
  id: string;
  client: {
    name: string;
    email: string;
  };
  docName: string;
  finalDocName: string;
  coverPages: Array<number>;
  paymentIntent: string;
  amountTotal: number;
  created: number;
}
