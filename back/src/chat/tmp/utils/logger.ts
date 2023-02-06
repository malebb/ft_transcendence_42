import logger from 'pino';
import dayjs from 'dayjs';

const log = logger({
	pettifier: true,
	base: {
		pid: false,
	},
	// timestamp: () => `,"time":"${dayjs().format()}"`,
});

export default log;