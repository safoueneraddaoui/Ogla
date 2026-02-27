import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.port', 4000)
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:3000')

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  )

  // CORS
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  })

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  await app.listen(port)
  console.log(`🚀 API running at http://localhost:${port}/graphql`)
}

bootstrap()
