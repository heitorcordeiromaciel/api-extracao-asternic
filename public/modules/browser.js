require('dotenv').config( { path: '/.env'} );
const { chromium } = require('playwright');
const logger = require('./../helpers/logger');

let browser;
let page;
let context;

const ip = process.env.ASTERNIC_IP;
const username = process.env.ASTERNIC_USER;
const password = process.env.ASTERNIC_PASSWORD;

const openBrowser = async () => {
	try {
		logger.log('Iniciando o navegador...');
		browser = await chromium.launch({ headless: true });
		context = await browser.newContext({ ignoreHTTPSErrors: true });
		page = await context.newPage();

		if (!ip || !username || !password) {
			throw new Error('Credenciais não definidas. Verifique as variáveis de ambiente ASTERNIC_IP, ASTERNIC_USER e ASTERNIC_PASS.');
		};

		logger.log('Tentando logar no asternic...');
		await page.goto(`https://${ip}/stats`);
		await page.locator('#user').fill(`${username}`);
		await page.locator('#password').fill(`${password}`);
		await page.locator('#submit').click();
		
		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Hoje' }).click();
		logger.log('Logado com sucesso!');
		await page.locator('#showReport').click();
		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Tempo Real' }).click();
		await page.waitForTimeout(500);
		logger.log('Browser ativo, aguardando conexões...');

	} catch (e) {
		if (context) await context.close();
		if (browser) await browser.close();
		logger.error(e);
		throw new Error(e);
	}
};

function getPage() {
	if (!page) throw new Error('Browser não inicializado');
	return page;
}

function getBrowser() {
	if (!browser) throw new Error('Browser não inicializado');
	return browser;
}

async function reopenBrowser() {
	if (context) await context.close();
    if (browser) await browser.close();
    await openBrowser();
}

module.exports = { openBrowser, getPage, getBrowser, reopenBrowser };