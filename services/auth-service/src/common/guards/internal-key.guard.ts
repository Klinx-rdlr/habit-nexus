import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-internal-key'] as string;
    const expected = this.config.get<string>('INTERNAL_KEY');

    if (!expected || !key || key !== expected) {
      throw new ForbiddenException('Invalid internal key');
    }

    return true;
  }
}
