import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(username: string, password: string) {
    return {
      message: 'Login success',
      user: { username },
      token: 'fake-jwt-token',
    };
  }

  register(username: string, password: string) {
    return {
      message: 'Register success',
      user: { username },
    };
  }
}
