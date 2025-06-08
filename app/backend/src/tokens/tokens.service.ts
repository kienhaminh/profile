import { Injectable } from '@nestjs/common';

@Injectable()
export class TokensService {
  createToken() {
    return 'token';
  }
}
