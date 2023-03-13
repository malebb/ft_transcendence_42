import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
// import { prisma } from '@prisma/client';
import { appendFile } from 'fs';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App e2e', () =>{
  let app : INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3000');
  });

  describe('Auth',() => {
    const dto : AuthDto = {
      email: 'xaxa@gmail.com',
      password: '1234',
    }
    describe('Signup', () => {
      it('should throw error email empty', () => {
        return pactum.spec().post('/auth/signup').withBody({password: dto.password,}).expectStatus(400)/*.inspect()*/;
      });
      it('should throw error password empty', () => {
        return pactum.spec().post('/auth/signup').withBody({email: dto.email,}).expectStatus(400)/*.inspect()*/;
      });
      it('should throw error body empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400)/*.inspect()*/;
      });
      it('should signup', () => {
        return pactum.spec().post('/auth/signup').withBody(dto).expectStatus(201)/*.inspect()*/;
      });
    });
    describe('Signin', () => {
      it('should throw error email empty', () => {
        return pactum.spec().post('/auth/signin').withBody({password: dto.password,}).expectStatus(400)/*.inspect()*/;
      });
      it('should throw error password empty', () => {
        return pactum.spec().post('/auth/signin').withBody({email: dto.email,}).expectStatus(400)/*.inspect()*/;
      });
      it('should throw error body empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400)/*.inspect()*/;
      });
      it('should signup', () => {
        return pactum.spec().post('/auth/signin').withBody(dto).expectStatus(200).stores('userAt', 'access_token')/*.inspect()*/;
      });
    });
  });
  describe('User',() => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum.spec().get('/users/me').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).expectStatus(200).inspect();
      });
    });
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: 'vvs',
        email: 'vvs@gmail.com'
      }
      it('should edit user', () => {
        return pactum.spec().patch('/users').withHeaders({
          Authorization: 'Bearer $S{userAt}'
        }).withBody(dto).expectStatus(200).inspect();
      });
    });
  });
  describe('Bookmark',() => {
    describe('Create bm', () => {});
    describe('Get bm', () => {});
    describe('Get bm by id', () => {});
    describe('Edit bm by id', () => {});
    describe('Delete bm by id', () => {});
  });


  afterAll(() => {
    app.close();
  });
  it.todo('should pass');
});