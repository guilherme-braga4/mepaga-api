export class UserDto {
  id?: number;
  name: string;
  email: string;
  password?: string;
}

export class LoginDto {
  id: number;
  email: string;
  password: string;
}

export class SignUpDto {
  name: string;
  email: string;
  password: string;
}

export class AuthenticatedUser {
  id?: number;
  name: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
