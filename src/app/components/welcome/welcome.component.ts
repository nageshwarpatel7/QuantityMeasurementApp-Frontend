import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {
  // this will inject is the modern way to get the Router service
  private router = inject(Router);

  goToLogin() {
    this.router.navigate(['/auth']);
  }
}