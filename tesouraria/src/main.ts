import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Offer Church - Tesouraria API')
    .setDescription('API para gestão de movimentos financeiros, usuários e dashboard do tesoureiro.')
    .setVersion('1.0.0')
    .addServer('http://localhost:' + (process.env.PORT || 3000), 'Local')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Insira o token JWT obtido em /auth/login' })
    .addTag('auth', 'Autenticação e emissão de tokens')
    .addTag('usuario', 'Gestão de usuários (CRUD)')
    .addTag('movimento', 'Registro de dízimos e ofertas')
    .addTag('dashboard', 'Indicadores e séries para o painel')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Filtro global de exceções para padronizar respostas de erro
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS para permitir consumo pelo frontend (Vite em dev e origin configurável em prod)
  const corsOriginsEnv = process.env.CORS_ORIGIN;
  const parsedOrigins = corsOriginsEnv
    ? corsOriginsEnv
        .split(',')
        .map((o) => o.trim())
        .filter((o) => !!o)
    : [];
  const allowAll = parsedOrigins.length === 0 || parsedOrigins.includes('*');
  const corsCredentials = (process.env.CORS_CREDENTIALS || 'false').toLowerCase() === 'true';

  app.enableCors({
    origin: allowAll ? true : parsedOrigins,
    credentials: corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  // eslint-disable-next-line no-console
  console.log('[CORS]', {
    allowAll,
    origins: allowAll ? '*' : parsedOrigins,
    credentials: corsCredentials,
  });

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
