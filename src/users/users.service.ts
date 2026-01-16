import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(dto: RegisterUserDto) {

    const { password, ...userData } = dto;

    const existingUser = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      ...userData,
      password: hashedPassword,
    });
    return await this.userRepo.save(newUser);
  }

  async login(dto: LoginUserDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas (email)');
    }

    if (user.password !== dto.password) {
      throw new UnauthorizedException('Credenciales inválidas (password)');
    }

    const { password, ...result } = user;
    return result;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}