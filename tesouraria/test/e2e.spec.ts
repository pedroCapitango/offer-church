import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';

describe('E2E Test', () => {
  let app: INestApplication;
  let token: string;
  let usuarioId: number;
  let movimentoId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Deve criar usuário', async () => {
    const res = await request(app.getHttpServer())
      .post('/usuario')
      .send({ usuario: 'testuser', senha: '123456' });
    expect(res.status).toBe(201);
    usuarioId = res.body.id;
  });

  it('Deve fazer login e receber token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ usuario: 'testuser', senha: '123456' });
    expect(res.status).toBe(201);
    expect(res.body.access_token).toBeDefined();
    token = res.body.access_token;
  });

  it('Deve criar movimento', async () => {
    const res = await request(app.getHttpServer())
      .post('/movimento')
      .send({ tipo: 'DIZIMO', nome: 'Teste', contato: '99999999', valor: 100 });
    expect(res.status).toBe(201);
    movimentoId = res.body.id;
  });

  it('Deve listar movimentos', async () => {
    const res = await request(app.getHttpServer())
      .get('/movimento');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Deve listar usuários (protegido)', async () => {
    const res = await request(app.getHttpServer())
      .get('/usuario')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Deve buscar usuário por ID (protegido)', async () => {
    const res = await request(app.getHttpServer())
      .get(`/usuario/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(usuarioId);
  });

  it('Deve atualizar usuário (protegido)', async () => {
    const res = await request(app.getHttpServer())
      .put(`/usuario/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ senha: '654321' });
    expect(res.status).toBe(200);
  });

  it('Deve remover usuário (protegido)', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/usuario/${usuarioId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  it('Deve buscar movimento por ID', async () => {
    const res = await request(app.getHttpServer())
      .get(`/movimento/${movimentoId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(movimentoId);
  });

  it('Deve atualizar movimento', async () => {
    const res = await request(app.getHttpServer())
      .put(`/movimento/${movimentoId}`)
      .send({ valor: 200 });
    expect(res.status).toBe(200);
  });

  it('Deve remover movimento', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/movimento/${movimentoId}`);
    expect(res.status).toBe(200);
  });
});
