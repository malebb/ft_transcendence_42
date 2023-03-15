	export const trimUsername = (username: string, maxSize: number) =>
	{
		return (username.length < maxSize ? username : username.slice(0, maxSize - 2) + '..');
	}

