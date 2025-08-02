import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService, CustomerProfileData } from '../customer';
import { ProfileWidget } from '../profile-widget/profile-widget';
import { SideNav } from '../side-nav/side-nav';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../login/login.service';
import { ThemeService } from '../theme';
 
@Component({
  selector: 'app-customer-profile',
  standalone: true,
  imports: [
    CommonModule,
    ProfileWidget,
    SideNav,
    ThemeToggle,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './customer-profile.html',
  styleUrls: ['./customer-profile.scss']
})
export class CustomerProfile implements OnInit {
  private customerService = inject(CustomerService);
  private loginService = inject(LoginService);
  private themeService = inject(ThemeService);
  customer = signal<CustomerProfileData | null>(null);
  loading = signal(true);
  error = signal('');
  darkMode = this.themeService.getDarkMode();
  ngOnInit() {
    const customerId = this.loginService.getCustomerId();
    if (customerId) {
      this.loadCustomerProfile(customerId);
    } else {
      this.error.set('No customer ID found. Please login again.');
      this.loading.set(false);
    }
  }
 
  private loadCustomerProfile(userId: string) {
    this.loading.set(true);
    this.error.set('');
    this.customerService.getCustomerProfile(userId).subscribe({
      next: response => {
        const profileData = response?.Envelope?.Body?.ZHS_FM_PROFILE_CUSTPORTALResponse;
        if (profileData) {
          const profile: CustomerProfileData = {
            userId: userId,
            name: profileData.EV_NAME || '',
            address: profileData.EV_ADDR || '',
            city: profileData.EV_CITY || '',
            country: profileData.EV_COUNTRY || '',
            region: profileData.EV_REGION || '',
            pincode: profileData.EV_PINCODE || '',
            email: profileData.EV_EMAIL || '',
            phone: profileData.EV_PHONE || '',
            profileImage: 'assets/profile.png'
          };
          this.customer.set(profile);
        } else {
          this.error.set('Failed to load customer profile data.');
        }
        this.loading.set(false);
      },
      error: err => {
        console.error('Error loading customer profile:', err);
        this.error.set('Failed to load customer profile. Please try again.');
        this.loading.set(false);
      }
    });
  }
}