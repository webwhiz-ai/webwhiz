import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppConfigService } from '../config/appConfig.service';

const POSTGRES = 'POSTGRES';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfig: AppConfigService): TypeOrmModuleOptions => {
        return {
          type: 'postgres',
          host: appConfig.get('postgresHost'),
          port: appConfig.get('postgresPort'),
          username: appConfig.get('postgresUsername'),
          password: appConfig.get('postgresPassword'),
          database: appConfig.get('postgresDatabaseName'),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Adjust this path to match your entities
          synchronize: appConfig.isDev, // Adjust based on your needs
        };
      },
    }),
  ],
  providers: [
    {
      provide: POSTGRES,
      useFactory: (options: TypeOrmModuleOptions) => options,
    },
  ],
  exports: [POSTGRES],
})
export class PostgresModule { }