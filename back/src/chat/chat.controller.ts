// fichier pour les requettes entrantesetle retour 
// de reponse vers client

import { Controller, Get } from '@nestjs/common';

@Controller('cats')
export class ChatController {
	@Get()
		findAll(): string {
			return 'This action returns all cats';
	}
}