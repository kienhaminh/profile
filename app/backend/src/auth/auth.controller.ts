import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() data: { email: string; password: string }) {
    return this.authService.register(data);
  }

  @Post('login')
  login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Body('token') token: string) {
    return this.authService.logout(token);
  }

  @Post('refresh')
  refresh(@Body('token') token: string) {
    return this.authService.refresh(token);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('change-password')
  changePassword(
    @Body() data: { token: string; newPassword: string },
  ) {
    return this.authService.changePassword(data);
  }
}
