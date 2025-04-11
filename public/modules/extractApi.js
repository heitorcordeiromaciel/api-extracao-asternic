const { chromium } = require('playwright');
const fs = require('fs');
const logger = require('./../helpers/logger');

const extractApi = async () => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ ignoreHTTPSErrors: true });
	const page = await context.newPage();

	try {
		logger.log('Tentando logar no asternic...');
		await page.goto('https://192.168.10.250/stats');
		await page.locator('#user').fill('admin');
		await page.locator('#password').fill('Imp3r@tr1z');
		await page.locator('#submit').click();
		logger.log('Logado com sucesso!');

		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Hoje' }).click();
		await page.locator('#showReport').click();
		await page.waitForTimeout(500);
		await page.getByRole('link', { name: 'Tempo Real' }).click();
		await page.waitForTimeout(500);

		setInterval(async () => {
			try {
				const data = await page.evaluate(() => {
					const rows = document.querySelectorAll('#yrealtimequeuesummary tbody tr');
					const queueData = [];

					rows.forEach(row => {
						const cells = row.querySelectorAll('td');
						if (cells.length === 13) {
							queueData.push({
								queue: cells[0].innerText.trim(),
								waiting: parseInt(cells[1].innerText.trim()) || 0,
								agents: parseInt(cells[2].innerText.trim()) || 0,
								available: parseInt(cells[3].innerText.trim()) || 0,
								busy: parseInt(cells[4].innerText.trim()) || 0,
								paused: parseInt(cells[5].innerText.trim()) || 0,
								received: parseInt(cells[6].innerText.trim()) || 0,
								answered: parseInt(cells[7].innerText.trim()) || 0,
								abandoned: parseInt(cells[8].innerText.trim()) || 0,
								abandonRate: cells[9].innerText.trim(),
								avgWait: cells[10].innerText.trim(),
								avgDuration: cells[11].innerText.trim(),
								maxWaitTime: cells[12].innerText.trim()
							});
						}
					});

					return queueData;
				});

				const agentes = await page.$$eval('table.stripped.table-bordered tbody tr', rows =>
					rows.map(row => {
						const cols = row.querySelectorAll('td');
						const nome = cols[1]?.innerText.trim();
						const sip = cols[1]?.querySelector('span')?.getAttribute('title') || '';
						const status = cols[2]?.innerText.trim();
						const duracao = cols[3]?.innerText.trim();
						const numero = cols[4]?.innerText.trim();
						const fila = cols[5]?.innerText.trim();
						const pena = cols[6]?.innerText.trim();
						const ultimaLig = cols[7]?.innerText.trim();
						const ligacoesAtend = cols[8]?.innerText.trim();
				
						return {
							nome,
							sip,
							status,
							duracao,
							numero,
							fila,
							pena,
							ultimaLig,
							ligacoesAtend
						};
					})
				);
				
				fs.writeFileSync('./data/agent_status.json', JSON.stringify(agentes, null, 2));
				fs.writeFileSync('./data/asternic_data.json', JSON.stringify(data, null, 2));
				logger.log('Dados atualizados com sucesso.');
			} catch (scrapeError) {
				logger.error('Erro ao tentar extrair dados: ' + scrapeError.message);
			}
		}, 5000);

	} catch (e) {
		logger.error('Erro ao inicializar extração: ' + e.message);
	}
};

module.exports.extractApi = extractApi;