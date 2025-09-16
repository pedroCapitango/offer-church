export class UsuarioDto {
  id?: number;
  usuario: string;
  senha: string;
  role?: 'TESOUREIRO' | 'ADMIN';
}
