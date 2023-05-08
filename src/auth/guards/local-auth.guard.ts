import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
class LocalAuthGuard extends AuthGuard('local') {}

export { LocalAuthGuard };
