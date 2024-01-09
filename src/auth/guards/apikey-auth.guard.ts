import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ApikeyAuthGuard extends AuthGuard('api-key') { }
