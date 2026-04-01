import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class MeasurementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.gatewayUrl}/api/v1/quantities`;

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    compare(requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/compare`, requestBody, {
            headers: this.getHeaders()
        });
    }

    convert(requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/convert`, requestBody, {
            headers: this.getHeaders()
        });
    }

    add(requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/add`, requestBody, {
            headers: this.getHeaders()
        });
    }

    subtract(requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/subtract`, requestBody, {
            headers: this.getHeaders()
        });
    }

    divide(requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/divide`, requestBody, {
            headers: this.getHeaders()
        });
    }

    // Generic method to call any endpoint
    calculate(action: string, requestBody: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/${action}`, requestBody, {
            headers: this.getHeaders()
        });
    }
}