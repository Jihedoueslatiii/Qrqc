import { Component, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-send-kpi',
  templateUrl: './send-kpi.component.html',
  styleUrls: ['./send-kpi.component.css']
})
export class SendKpiComponent implements OnDestroy {
  receivers: string[] = [''];
  isSending: boolean = false;
  hasInvalidEmails: boolean = false;
  scheduledDate: string = '';
  scheduledTime: string = '';
  scheduledDateTime: Date | null = null;
  isScheduled: boolean = false;
  private scheduleTimeout: any = null;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnDestroy(): void {
    // Clear any pending timeouts when component is destroyed
    this.cancelSchedule(false); // Silent cancellation on destroy
  }

  // Add a new receiver input
  addReceiver() {
    this.receivers.push('');
    this.validateEmails();
  }

  // Remove a receiver by index
  removeReceiver(index: number) {
    this.receivers.splice(index, 1);
    this.validateEmails();
  }

  // Validate a single email
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !email || emailRegex.test(email);
  }

  // Validate all emails
  validateEmails() {
    this.hasInvalidEmails = this.receivers.some(email => !this.isValidEmail(email) && email !== '');
  }

  // Validate on input change
  validateEmail(index: number) {
    this.validateEmails();
  }

  // Validate and set schedule
  validateSchedule() {
    // If either date or time is missing, don't cancel or schedule yet
    if (!this.scheduledDate || !this.scheduledTime) {
      if (this.isScheduled) {
        this.cancelSchedule(false); // Silent cancellation if schedule was active
      }
      return;
    }

    const [year, month, day] = this.scheduledDate.split('-').map(Number);
    const [hours, minutes] = this.scheduledTime.split(':').map(Number);
    const scheduled = new Date(year, month - 1, day, hours, minutes, 0);
    const now = new Date();

    if (scheduled <= now) {
      this.toastr.error('Please select a future date and time.', 'Invalid Schedule');
      this.scheduledDate = '';
      this.scheduledTime = '';
      this.scheduledDateTime = null;
      this.isScheduled = false;
      return;
    }

    // Clear any existing schedule before setting a new one
    if (this.scheduleTimeout) {
      clearTimeout(this.scheduleTimeout);
      this.scheduleTimeout = null;
    }

    const delay = scheduled.getTime() - now.getTime();
    this.scheduledDateTime = scheduled;
    this.isScheduled = true;
    this.scheduleTimeout = setTimeout(() => this.sendKpiAlert(true), delay);
    this.toastr.success(
      `KPI Report scheduled for ${this.formatDateTime(scheduled)}`,
      'Scheduled'
    );
  }

  // Cancel scheduled send
  cancelSchedule(showToast: boolean = true) {
    if (this.scheduleTimeout) {
      clearTimeout(this.scheduleTimeout);
      this.scheduleTimeout = null;
    }
    this.isScheduled = false;
    this.scheduledDate = '';
    this.scheduledTime = '';
    this.scheduledDateTime = null;
    if (showToast) {
      this.toastr.info('Scheduled send cancelled.', 'Cancelled');
    }
  }

  // Format date and time for display
  private formatDateTime(date: Date): string {
    return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}`;
  }

  // Send KPI alert
  sendKpiAlert(isScheduledSend: boolean = false) {
    this.validateEmails();
    if (this.hasInvalidEmails) {
      this.toastr.error('Please fix invalid email addresses.', 'Invalid Input');
      return;
    }

    if (this.receivers.length === 0 || this.receivers.every(email => email === '')) {
      this.toastr.error('Please add at least one valid email.', 'No Receivers');
      return;
    }

    this.isSending = true;
    this.http.post<any[]>('http://localhost:8089/api/alerts/check', this.receivers)
      .subscribe({
        next: (response) => {
          this.isSending = false;
          this.toastr.success('KPI Alerts sent successfully!', 'Success');
          console.log('✅ KPI Alerts Sent', response);
          this.receivers = ['']; // Reset receivers after success
          if (isScheduledSend) {
            this.cancelSchedule(false); // Silent cancellation after scheduled send
          }
        },
        error: (err) => {
          this.isSending = false;
          this.toastr.error('Failed to send KPI Alerts.', 'Error');
          console.error('❌ Failed:', err);
          if (isScheduledSend) {
            this.cancelSchedule(false); // Silent cancellation on error
          }
        }
      });
  }
}