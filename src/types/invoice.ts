export interface IItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface ICompany {
  name: string;
  gst?: string;
  address?: string;
  phone?: string;
  email?: string;
  bank?: string;
  placeOfSupply?: string;
  logo?: string;
}

export interface IClient {
  name: string;
  gst?: string;
  address?: string;
  placeOfSupply?: string;
}

export interface IInvoice {
  _id?: string;
  invoiceNo: string;
  date: string | Date;
  company: ICompany;
  client: IClient;
  items: IItem[];
  taxRate?: number;
  subtotal?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  totalTax?: number;
  grandTotal?: number;
  notes?: string;
}
