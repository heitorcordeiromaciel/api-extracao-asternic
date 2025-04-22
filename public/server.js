require('dotenv').config({ path: '/.env' });
const path = require('path');
const express = require('express');
const { extractApi } = require('./modules/extractApi');
const { openBrowser, reopenBrowser } = require('./modules/browser');
const logger = require('./helpers/logger');

const app = express();
router = express.Router();
const port = process.env.SERVER_PORT;
const ip = process.env.SERVER_IP;

app.get('/extract-asternic', async (req, res) => {
	try {
		const result = await extractApi();
		res.json(result);
	} catch (e) {
		if (e.message.includes('Sessão expirada')) {
			logger.warn('Tentando relogar...');
			await reopenBrowser();
			const retry = await extractApi();
			return res.json(retry);
		};
	};

});

app.listen(port, ip, () => {
	logger.log(`Servidor iniciado em http://${ip}:${port}`);
	openBrowser();
});