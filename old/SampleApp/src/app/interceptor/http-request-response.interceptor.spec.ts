import { TestBed } from '@angular/core/testing';

import { HttpRequestResponseInterceptor } from './http-request-response.interceptor';
import { AppModule } from '../app.module';

describe('HttpRequestResponseInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppModule],
    providers: [HttpRequestResponseInterceptor]
  }));

  it('should be created', () => {
    const interceptor: HttpRequestResponseInterceptor = TestBed.inject(HttpRequestResponseInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
