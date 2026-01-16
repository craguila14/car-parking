import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterUserDto } from 'src/users/dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

async register(dto: RegisterUserDto) {
  const newUser = await this.usersService.create(dto);

  const payload = { email: newUser.email, sub: newUser.id, role: newUser.role };
  const token = this.jwtService.sign(payload);

  return {
    user: newUser,
    access_token: token,
  };
}

  async login(email: string, pass: string) {
    const user = await this.usersService.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}