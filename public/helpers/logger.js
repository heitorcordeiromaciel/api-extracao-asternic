let subscribers = [];

const broadcast = (type, message) => {
	const payload = `${type.toUpperCase()}: ${message}`;
	console[type](payload);
	for (const res of subscribers) {
		res.write(`data: ${payload}\n\n`);
	}
}

const log = (message) => {
	broadcast('log', message);
}

const error = (message) => {
	broadcast('error', message);
}

const warn = (message) => {
	broadcast('warn', message);
}

const info = (message) => {
	broadcast('info', message);
}

const debug = (message) => {
	broadcast('debug', message);
}

const addSubscriber = (res) => {
	subscribers.push(res);
	res.on('close', () => {
		subscribers = subscribers.filter(s => s !== res);
	});
}

module.exports = {
	log,
	error,
	warn,
	info,
	debug,
	addSubscriber,
};