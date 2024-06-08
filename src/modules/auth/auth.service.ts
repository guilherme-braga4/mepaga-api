import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  LoginDto,
  SignUpDto,
  AuthenticatedUser,
  UserDto,
} from './dtos/auth.dto';
import { jwtConstants } from './constants/secret';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly saltOrRounds = 10;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn({
    email,
    password,
  }: LoginDto): Promise<Partial<AuthenticatedUser>> {
    const { password: _password, ...rest } =
      (await this.usersService.findOne(email)) ?? {};

    if (!_password) {
      throw new HttpException(
        `It's seems that you're new here :/`,
        HttpStatus.NOT_FOUND,
      );
    }
    const isUserAuthenticated = await this.comparePassword(password, _password);
    if (!isUserAuthenticated) {
      throw new HttpException(
        `Ops, i don't know you! :(`,
        HttpStatus.FORBIDDEN,
      );
    }

    const authenticatedUser = await this.generateToken(rest);

    return authenticatedUser;
  }

  async signUp({
    password,
    ...rest
  }: { password: string } & SignUpDto): Promise<Partial<SignUpDto>> {
    const hashPassword = await this.hashPassword(password);

    const userPayload: SignUpDto = {
      ...rest,
      password: hashPassword,
    };

    const { name, email } = await this.usersService.create(userPayload);

    return {
      name: name,
      email: email,
    };
  }

  async generateToken(
    payload: Partial<AuthenticatedUser>,
  ): Promise<Partial<AuthenticatedUser>> {
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '2h',
      secret: jwtConstants.secret_refresh,
    });

    return {
      id: payload.id,
      email: payload.email,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async reauthenticateSession({ refreshToken }: any): Promise<any> {
    //1 - (SEGURANÇA) Validar SE o Token recebido existe
    const payload = await this.validateRefreshToken(refreshToken);

    //2 - Gerar um novo Token
    return await this.generateToken(payload);
  }

  private async validateRefreshToken(refreshToken: string): Promise<UserDto> {
    if (!refreshToken) {
      throw new NotFoundException('This token seems to not belongs any user');
    }

    const email = this.jwtService.decode(refreshToken)['email'];

    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new NotFoundException('User not founded');
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: jwtConstants.secret_refresh,
      });
      return user;
    } catch (err) {
      if (err.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid Signature');
      }
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Expired Token');
      }
      throw new UnauthorizedException(err.name);
    }
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltOrRounds);
  }

  async comparePassword(
    stringPassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(stringPassword, hashPassword);
  }
}
