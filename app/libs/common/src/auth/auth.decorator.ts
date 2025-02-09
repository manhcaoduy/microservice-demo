import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// export const CurrentUser = createParamDecorator(
//   (data: unknown, ctx: ExecutionContext): User => {
//     const request = ctx.switchToHttp().getRequest();
//     return request.user;
//   },
// );
