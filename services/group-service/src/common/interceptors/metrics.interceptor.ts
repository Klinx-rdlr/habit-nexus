import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpDuration: Histogram,
    @InjectMetric('http_requests_total')
    private readonly httpTotal: Counter,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const route = req.route?.path || req.path;
    const end = this.httpDuration.startTimer({ method, route });

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const statusCode = String(res.statusCode);
          end({ status_code: statusCode });
          this.httpTotal.inc({ method, route, status_code: statusCode });
        },
        error: (err) => {
          const statusCode = String(err.status || 500);
          end({ status_code: statusCode });
          this.httpTotal.inc({ method, route, status_code: statusCode });
        },
      }),
    );
  }
}
