import { Controller, Get} from '@nestjs/common'
import { PongService } from './pong.service'

@Controller()
export class PongController {

	constructor(private readonly pongService : PongService)
	{
	}

	@Get('skin:')
	getSkin() : string
	{
		return ("");
	}
}
