import logger from '../utils/logger.js';
import { NodeEnv } from '../constants/common.js';

const errorMiddleware = (err, req, res, next) => {
	logger.error(err.message, err.stack);

	if (res.headersSent) {
		return next(err);
	}

	// Respect an explicit status set on the error (e.g. 401 from pb-user,
	// 403 from admin gate, 422 from input validation). Default to 500.
	const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
		? err.status
		: 500;

	res.status(status).json({
		message: status >= 500 ? 'Something went wrong!' : err.message,
		...(process.env.NODE_ENV !== NodeEnv.Production && {
			error: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
		}),
	});
};

export default errorMiddleware;
export { errorMiddleware };
