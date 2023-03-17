import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { PenaltyDto } from '../penalty/Penalty';
import { Accessibility } from 'ft_transcendence';

export class ChatRoomDto {
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	userId?: number;

	@IsString()
	@IsOptional()
	password?: string;

	@IsString()
	@IsOptional()
	name?: string;

	@IsOptional()
	accessibility?: Accessibility;

	@IsOptional()
	penalty?: PenaltyDto;
}
