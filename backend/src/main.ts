import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ModuloAplicacion } from './modulo-aplicacion';
import { RespuestaInterceptor } from './comun/interceptores/respuesta.interceptor';
import { ExcepcionHttpFiltro } from './comun/filtros/excepcion-http.filtro';

async function iniciarServidor() {
  const aplicacion = await NestFactory.create(ModuloAplicacion);

  aplicacion.enableCors({
    origin: true,
    credentials: true,
  });

  aplicacion.setGlobalPrefix('api');
  aplicacion.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  aplicacion.useGlobalInterceptors(new RespuestaInterceptor());
  aplicacion.useGlobalFilters(new ExcepcionHttpFiltro());

  const documentoConfig = new DocumentBuilder()
    .setTitle('API Proyecto Base')
    .setDescription('Documentacion de endpoints para autenticacion y administracion')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(aplicacion, documentoConfig);
  SwaggerModule.setup('api/docs', aplicacion, documento);
  aplicacion.getHttpAdapter().get('/api/openapi.json', (req, res) => {
    res.type('application/json').send(documento);
  });

  const puerto = process.env.PORT || 3000;
  await aplicacion.listen(puerto);
  // eslint-disable-next-line no-console
  console.log(`API escuchando en http://localhost:${puerto}/api`);
}

iniciarServidor();
