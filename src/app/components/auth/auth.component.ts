import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoginMode = true;
  showPassword = false;
  errorMessage = '';

  loginData = { 
    email: '', 
    password: '' 
  };

  signupData = { 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  };

  ngOnInit() {
    // Check if we are returning from Google with a code
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      if (code) {
        this.processGoogleLogin(code);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showLoginForm() {
    this.isLoginMode = true;
    this.errorMessage = '';
    this.showPassword = false;
  }

  showSignupForm() {
    this.isLoginMode = false;
    this.errorMessage = '';
    this.showPassword = false;
  }

  onLogin() {
    this.errorMessage = '';
    
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.errorMessage || 'An error occurred. Please try again.';
      }
    });
  }

  onSignup() {
    this.errorMessage = '';
    
    if (!this.signupData.username || !this.signupData.email || !this.signupData.password || !this.signupData.confirmPassword) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    if (this.signupData.password !== this.signupData.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    const signupPayload = {
      username: this.signupData.username,
      email: this.signupData.email,
      password: this.signupData.password,
      role: 'USER'
    };

    this.authService.register(signupPayload).subscribe({
      next: (res) => {
        alert(res.message || 'Registration successful! Please login.');
        this.isLoginMode = true;
        this.signupData = { username: '', email: '', password: '', confirmPassword: '' };
      },
      error: (err) => {
        this.errorMessage = err.error?.message || err.error?.errorMessage || 'An error occurred. Please try again.';
      }
    });
  }

  loginWithGoogle() {
    this.authService.initiateGoogleLogin();
  }
  
  private processGoogleLogin(code: string) {
    this.authService.handleGoogleCallback(code).subscribe({
      next: (res) => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage = 'Google Authentication failed.';
      }
    });
  }
}