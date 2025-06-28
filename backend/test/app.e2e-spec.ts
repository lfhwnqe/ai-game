import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
        expect(res.body.version).toBe('1.0.0');
      });
  });

  it('/health/version (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health/version')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('AI Game Backend');
        expect(res.body.version).toBe('1.0.0');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
