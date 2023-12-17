import { Module } from '@nestjs/common';
import { ImportersModule } from '../importers/importers.module';
import { CaasControlle } from './caas.controller';
import { CaasService } from './caas.service';
import { CeleryClientModule } from '../common/celery/celery-client.module';

@Module({
  imports: [ImportersModule, CeleryClientModule],
  controllers: [CaasControlle],
  providers: [CaasService],
  exports: [],
})
export class CaasModule {}
