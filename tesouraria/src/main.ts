import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentação automática gerada pelo Swagger')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Garante que diretório de uploads exista (ex: Render ephemeral system no build step)
  const uploadDir = process.env.UPLOAD_DIR || 'uploads';
  const fullUploadPath = join(process.cwd(), uploadDir);
  if (!existsSync(fullUploadPath)) {
    mkdirSync(fullUploadPath, { recursive: true });
    // eslint-disable-next-line no-console
    console.log(`[bootstrap] Diretório de uploads criado em ${fullUploadPath}`);
  }

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API escutando na porta ${port}`);
}
bootstrap();
