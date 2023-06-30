import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from '../constants/constants';
import { UsersService } from 'src/modules/user/user.service';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      // context.getClass(),
    ]);
    if (!token) {
      throw new UnauthorizedException('You are not authorized');
    }
    if (!requiredRoles) {
      const payload = await this.getPayload(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }
      const user = await this.userService.findOneById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }
      req['user'] = payload;
      req['authUser'] = user;
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      const user = await this.userService.findOneById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('Invalid user');
      }
      req['user'] = payload;
      req['authUser'] = user;
      return requiredRoles.some((role) => user.role?.includes(role));
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async getPayload(token: string) {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
    } catch (error) {
      return null;
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
