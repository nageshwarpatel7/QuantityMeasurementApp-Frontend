import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private authApiUrl = `${environment.gatewayUrl}/auth/user`;

    register(userData: any): Observable<any> {
        return this.http.post(`${this.authApiUrl}/register`, userData);
    }

    login(credentials: any): Observable<any> {
        return this.http.post(`${this.authApiUrl}/login`, credentials).pipe(
            tap((res: any) => {
                if (res.token) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('userEmail', credentials.email);
                }
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        this.router.navigate(['/auth']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }

    getToken() {
        return localStorage.getItem('token');
    }

    initiateGoogleLogin() {
        const clientId = `${environment.googleClientId}`;
        const redirectUri = `${environment.googleRedirectUri}`; // Points back to this component
        const scope = 'profile email';
        const responseType = 'code';

        const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=select_account`;

        window.location.href = url;
    }

    handleGoogleCallback(code: string): Observable<any> {
        const callbackUrl = `${environment.gatewayUrl}/auth/google/callback?code=${code}`;
        return this.http.get(callbackUrl).pipe(
            tap((res: any) => {
                if (res.token) localStorage.setItem('token', res.token);
            })
        );
    }
}
