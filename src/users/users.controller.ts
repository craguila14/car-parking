import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() registerDto: RegisterUserDto) {
    return this.usersService.create(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    return this.usersService.login(loginDto);
  }
}