# Backend Authentication Plan

This folder contains the initial database schema for authentication using Prisma.

The schema defines:
- `User` table with `email` and hashed password
- `OauthAccount` for Google logins
- `RefreshToken` for issuing new JWTs
- `PasswordResetToken` for password recovery

Next steps include implementing the NestJS modules and API routes for:
- Register
- Login
- Logout
- Refresh token
- Forgot password
- Change password
- OAuth2 login with Google

Unit tests should be added alongside the implementation to maintain coverage.
