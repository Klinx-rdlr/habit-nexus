import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return {
      id: request.headers['x-user-id'] as string,
      timezone: request.headers['x-user-timezone'] as string,
    };
  },
);
