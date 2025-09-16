import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const usuario = process.env.SEED_TESOUREIRO_USER || 'tesoureiro';
  const senhaPlano = process.env.SEED_TESOUREIRO_PASS || 'Senha@123';

  const exists = await prisma.usuario.findUnique({ where: { usuario } });
  if (exists) {
    console.log(`[seed] Usuário padrão já existe: ${usuario}`);
    return;
  }
  const hash = await bcrypt.hash(senhaPlano, 10);
  const created = await prisma.usuario.create({
    data: {
      usuario,
      senha: hash,
      role: 'TESOUREIRO',
    },
  });
  console.log(`[seed] Usuário tesoureiro criado: ${created.usuario}`);
}

main()
  .catch((e) => {
    console.error('[seed] Erro ao executar seed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
