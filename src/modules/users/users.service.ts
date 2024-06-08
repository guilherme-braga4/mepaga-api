import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { User } from '@prisma/client';
import { SignUpDto } from '../auth/dtos/auth.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email: email } });
  }

  async create(dto: SignUpDto): Promise<any> {
    return this.prisma.user.create({ data: dto });
  }
}
