import { Routes } from '@angular/router';
 
import { Login } from './login/login';
import { CustomerProfile } from './customer-profile/customer-profile';
import { InquiryDetails } from './inquiry-details/inquiry-details';
import { SalesOrders } from './sales-orders/sales-orders';
import { Delivery } from './delivery/delivery';
import { InvoiceDetails } from './invoice-details/invoice-details';
import { PaymentAging } from './payment-aging/payment-aging';
import { CreditDebitMemoComponent } from './credit-debit-memo/credit-debit-memo';
import { OverallSalesDataComponent } from './overall-sales-data/overall-sales-data';
 
export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'dashboard', component: CustomerProfile },
  { path: 'profile', component: CustomerProfile },
  { path: 'inquiry', component: InquiryDetails },
  { path: 'sales-orders', component: SalesOrders },
  { path: 'delivery', component: Delivery },
  { path: 'invoice-details', component: InvoiceDetails },
  { path: 'payment-aging', component: PaymentAging },
  { path: 'credit-debit-memo', component: CreditDebitMemoComponent },
  { path: 'overall-sales-data', component: OverallSalesDataComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];