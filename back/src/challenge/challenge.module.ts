import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import ChallengeController from './challenge.controller';
import { GameModule } from '../game/game.module';

@Module({
	imports: [GameModule],
	controllers: [ChallengeController],
	providers: [ChallengeService],
	exports: [ChallengeService]
})
export class ChallengeModule {};
