export interface CustomerIncludeOptions {
  invoices?: boolean | InvoiceIncludeOptions;
}

export interface InvoiceIncludeOptions {
  customer?: boolean | CustomerIncludeOptions;
  items?: boolean | InvoiceItemIncludeOptions;
  payments?: boolean | InvoicePaymentIncludeOptions;
  status?: boolean | InvoiceStatusIncludeOptions;
}

export interface InvoiceItemIncludeOptions {
  product?: boolean | ProductIncludeOptions;
  invoice?: boolean | InvoiceIncludeOptions;
}

export interface InvoicePaymentIncludeOptions {
  invoice?: boolean | InvoiceIncludeOptions;
}

export interface InvoiceStatusIncludeOptions {
  invoices?: boolean | InvoiceIncludeOptions;
}

export interface ProductIncludeOptions {
  priceHistory?: boolean | ProductPriceHistoryIncludeOptions;
  productType?: boolean | ProductTypeIncludeOptions;
  invoiceItems?: boolean | InvoiceItemIncludeOptions;
}

export interface ProductPriceHistoryIncludeOptions {
  product?: boolean | ProductIncludeOptions;
}

export interface ProductTypeIncludeOptions {
  products?: boolean | ProductIncludeOptions;
}
