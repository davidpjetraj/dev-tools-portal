import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { StorageModule } from '../storage';
import { FilesController } from './files.controller';

@Module({
    imports: [StorageModule],
    controllers: [FilesController],
    providers: [FilesService],
    exports: [FilesService],
})
export class FilesModule { }
