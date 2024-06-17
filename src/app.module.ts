import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PointModule } from './point/point.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PointModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
