import { PenaltyType } from 'ft_transcendence';
import { IsString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class PenaltyDto
{
	@IsInt()
	@IsOptional()
	@Type(() => Number)
	authorId?: number;

	@IsInt()
	@IsOptional()
	@Type(() => Number)
	targetId?: number;

	@IsString()
	@IsOptional()
	roomName?: string;

	@IsOptional()
	type?:	PenaltyType;
}
