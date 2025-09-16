import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login e obtenção de token JWT' })
  async login(@Body() authDto: AuthDto) {
    const user = await this.authService.validateUser(authDto.usuario, authDto.senha);
    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }
    return this.authService.login(user);
  }
}
