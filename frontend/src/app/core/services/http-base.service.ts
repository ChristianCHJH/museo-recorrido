import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/environment';

type RequestOptions = {
  headers?: HttpHeaders | {
    [header: string]: string | string[];
  };
  params?: HttpParams | {
    [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean>;
  };
};

@Injectable({
  providedIn: 'root'
})
export class HttpBaseService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  post<T>(endpoint: string, payload: unknown, options?: RequestOptions) {
    return this.http.post<T>(this.buildUrl(endpoint), payload, options);
  }

  patch<T>(endpoint: string, payload: unknown, options?: RequestOptions) {
    return this.http.patch<T>(this.buildUrl(endpoint), payload, options);
  }

  put<T>(endpoint: string, payload: unknown, options?: RequestOptions) {
    return this.http.put<T>(this.buildUrl(endpoint), payload, options);
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }

  private buildUrl(endpoint: string) {
    return endpoint.startsWith('http') ? endpoint : `${this.apiUrl.replace(/\/$/, '')}/${endpoint}`;
  }
}
