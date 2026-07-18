import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LogsService } from '../logs/logs.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      role: dto.role ?? 'student',
    });

    await this.logsService.recordActivity({
      userId: user.id,
      action: 'SIGNUP',
      metadata: { email: user.email, role: user.role },
    });

    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      await this.logsService.recordActivity({
        userId: user.id,
        action: 'LOGIN_FAILED',
        metadata: { email: dto.email },
      });
      throw new UnauthorizedException('Invalid email or password');
    }

    await this.logsService.recordActivity({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      metadata: { email: user.email },
    });

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
