// ===================================================================
// 🔌 HTTP INTERCEPTOR - src/app/interceptors/auth.interceptor.ts
// ===================================================================

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    // Agregar token de autorización si está disponible
    const authReq = this.addAuthHeader(req);
    
    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }
  
  private addAuthHeader(request: HttpRequest<any>): HttpRequest<any> {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      return request.clone({
        setHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });
    }
    
    return request;
  }
  
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      
      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);
          
          // Reintentar la petición original con el nuevo token
          return next.handle(this.addAuthHeader(request));
        }),
        catchError(error => {
          this.isRefreshing = false;
          
          // Si falla el refresh, cerrar sesión
          this.authService.logout().subscribe();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando, esperar
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(() => next.handle(this.addAuthHeader(request)))
      );
    }
  }
}