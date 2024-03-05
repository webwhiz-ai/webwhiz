import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_API_KEY_AUTH } from '../../common/decorators/apikey.decorator';
import { IS_PUBLIC_KEY } from './public.guard';

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isApikeyAuth = this.reflector.getAllAndOverride<boolean>(
      IS_API_KEY_AUTH,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isApikeyAuth) {
      return true;
    }
    return super.canActivate(context);
  }
}

export { JwtAuthGuard };
