const path = require('path');
const express = require('express');
const { extractApi } = require('./modules/extractApi');
const { openBrowser } = require('./modules/browser');
const logger = require('./helpers/logger');

const app = express();
router = express.Router();
const port = 8080;
const ip = '';

app.use('/data', express.static(path.join(__dirname, 'data')));
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/extract-asternic', async (req, res) => {
	const result = await extractApi();
	res.json(result);
});

app.listen(port, ip, () => {
	logger.log(`Servidor iniciado em http://${ip}:${port}`);
	openBrowser();
});