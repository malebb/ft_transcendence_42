import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
	let request : any;

	if (ctx.getType() === 'http')
	    request = ctx.switchToHttp().getRequest();
	else if (ctx.getType() === 'ws')
	{
	    request = ctx.switchToWs();
		if (!Object.keys(request.args[0].handshake.auth).length
			|| request.args[0].handshake.auth.token === undefined)
			return ('');
		return(request.args[0].handshake.auth.token);
	}

    if (data)
    	return request.user[data];
    return request.user;
  },
);
