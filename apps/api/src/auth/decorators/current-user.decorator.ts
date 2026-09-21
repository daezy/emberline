import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest, JwtPayload } from '../auth.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
