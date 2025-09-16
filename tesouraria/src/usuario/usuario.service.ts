import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsuarioDto } from './usuario.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(data: UsuarioDto) {
    const hashed = await bcrypt.hash(data.senha, 10);
    return this.prisma.usuario.create({
      data: { ...data, senha: hashed },
      select: { id: true, usuario: true, role: true },
    });
  }

  async findAll() {
    return this.prisma.usuario.findMany({
      select: { id: true, usuario: true, role: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, usuario: true, role: true },
    });
  }

  async update(id: number, data: Partial<UsuarioDto>) {
    if (data.senha) {
      data.senha = await bcrypt.hash(data.senha, 10);
    }
    return this.prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, usuario: true, role: true },
    });
  }

  async remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
      select: { id: true, usuario: true, role: true },
    });
  }
}
