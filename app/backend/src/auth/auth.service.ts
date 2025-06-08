import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  register(data: { email: string; password: string }) {
    return { message: 'register', data };
  }

  login(data: { email: string; password: string }) {
    return { message: 'login', data };
  }

  logout(token: string) {
    return { message: 'logout', token };
  }

  refresh(token: string) {
    return { message: 'refresh', token };
  }

  forgotPassword(email: string) {
    return { message: 'forgotPassword', email };
  }

  changePassword(data: { token: string; newPassword: string }) {
    return { message: 'changePassword', data };
  }
}
