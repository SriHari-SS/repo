import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CustomerService } from '../../services/customer.service';
import { CustomerProfile } from '../../models/customer.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profile = signal<CustomerProfile | null>(null);
  loading = signal(true);
  error = signal('');
  isEditing = signal(false);

  constructor(
    private authService: AuthService,
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.error.set('');

    this.customerService.getProfile().subscribe({
      next: (response) => {
        this.loading.set(false);
        
        if (response.success && response.data) {
          this.profile.set(response.data);
        } else {
          this.error.set(response.message || 'Failed to load profile data');
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set('Error loading profile data');
        console.error('Profile error:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleEdit(): void {
    this.isEditing.set(!this.isEditing());
  }

  saveProfile(): void {
    // In a real implementation, this would call an update API
    console.log('Saving profile changes...');
    this.isEditing.set(false);
    // For now, just toggle edit mode
    // TODO: Implement profile update functionality
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    // Reload original data
    this.loadProfile();
  }

  getInitials(name: string): string {
    if (!name) return 'CU';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return 'Not provided';
    
    // Simple phone formatting - can be enhanced based on requirements
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  getFullAddress(): string {
    const profile = this.profile();
    if (!profile) return 'Not provided';
    
    const parts = [
      profile.address,
      profile.city,
      profile.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}
