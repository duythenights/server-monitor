import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ICurrentUser } from './current-user.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const user: ICurrentUser = {
      id: 'default-1',
      name: 'Default User',
      email: 'default@user.com',
    };
    request['user'] = user;

    return true;
  }
}
