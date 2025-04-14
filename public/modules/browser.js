const { chromium } = require('playwright');
const logger = require('./../helpers/logger');

let browser;
let page;

const openBrowser = async () => {
	browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	page = await context.newPage();

	const ip = 'http://10.70.10.252/stats';
	const username = 'admin';
	const password = '1ts@Cust0m3R';

	try {
		logger.log('Tentando logar no asternic...');
		await page.goto(`${ip}`);
		await page.locator('#user').fill(`${username}`);
		await page.locator('#password').fill(`${password}`);
		await page.locator('#submit').click();
		logger.log('Logado com sucesso!');

		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Hoje' }).click();
		await page.locator('#showReport').click();
		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Tempo Real' }).click();
		await page.waitForTimeout(500);
		logger.log('Browser ativo, aguardando conexões...')
		
	} catch (e) {
		context.close();
		browser.close();
		logger.error(e);
		throw new Error(e);
	};
};

function getPage() {
	if (!page) throw new Error('Browser não inicializado');
	return page;
}

function getBrowser() {
	if (!browser) throw new Error('Browser não inicializado');
	return browser;
}

module.exports = { openBrowser, getPage, getBrowser };