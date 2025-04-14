const { chromium } = require('playwright');
const fs = require('fs');
const logger = require('./../helpers/logger');
const { getPage } = require('./browser');

const extractApi = async () => {
	try {
		const page = getPage();
		try {
			const data = await page.evaluate(() => {
				const rows = document.querySelectorAll('#yrealtimequeuesummary tbody tr');
				const queueData = {};

				const parseTimeToSecondsString = (time) => {
					const parts = time.split(':').map(part => parseInt(part, 10));
					if (parts.length === 3) {
						return (parts[0] * 3600 + parts[1] * 60 + parts[2]).toString();
					} else if (parts.length === 2) {
						return (parts[0] * 60 + parts[1]).toString();
					}
					return "0";
				};

				rows.forEach(row => {
					const cells = row.querySelectorAll('td');
					if (cells.length === 13) {
						let queueName = cells[0].innerText.trim();

						switch (queueName) {
							case "RECEPTIVO":
								queueName = "20000";
								break;
							case "ATIVO":
								queueName = "30000";
								break;
							case "CALLBACK":
								queueName = "40000";
								break;
							default:
								queueName = "unknown";
						}

						queueData[queueName] = {
							"Waiting": cells[1].innerText.trim(),
							"Agents": cells[2].innerText.trim(),
							"Available": cells[3].innerText.trim(),
							"Busy": cells[4].innerText.trim(),
							"Paused": cells[5].innerText.trim(),
							"Received": cells[6].innerText.trim(),
							"Answered": cells[7].innerText.trim(),
							"Abandoned": cells[8].innerText.trim(),
							"Abandon Rate": cells[9].innerText.trim().replace('%', '').trim(),
							"Avg Wait": parseTimeToSecondsString(cells[10].innerText.trim()),
							"Avg Duration": parseTimeToSecondsString(cells[11].innerText.trim()),
							"Max. wait time": parseTimeToSecondsString(cells[12].innerText.trim())
						};
					}
				});

				return { queue: queueData };
			});

			const agents = await page.$$eval('table.stripped.table-bordered tbody tr', rows => {
				const result = {};

				const parseDurationToSeconds = (timeStr) => {
					const parts = timeStr.split(':').map(p => parseInt(p, 10));
					if (parts.length === 3) {
						return (parts[0] * 3600 + parts[1] * 60 + parts[2]).toString();
					}
					return "0";
				};

				rows.forEach(row => {
					const cols = row.querySelectorAll('td');
					let queueType = cols[0]?.innerText.trim();
					const nome = cols[1]?.innerText.trim();
					const sip = cols[1]?.querySelector('span')?.getAttribute('title') || '';
					const statusText = cols[2]?.innerText.trim();
					const duracao = cols[3]?.innerText.trim();
					const numero = cols[4]?.innerText.trim();
					let fila = cols[5]?.innerText.trim() || "";
					const pena = cols[6]?.innerText.trim();
					const ultimaLig = cols[7]?.innerText.trim();
					const ligacoesAtend = cols[8]?.innerText.trim();

					switch (queueType) {
						case "RECEPTIVO":
							queueType = "20000";
							break;
						case "ATIVO":
							queueType = "30000";
							break;
						case "CALLBACK":
							queueType = "40000";
							break;
						default:
							queueType = "unknown";
					}

					switch (fila) {
						case "RECEPTIVO":
							fila = "20000";
							break;
						case "ATIVO":
							fila = "30000";
							break;
						case "CALLBACK":
							fila = "40000";
							break;
						default:
							fila = "";
					}

					let status = "unavailable";
					const lowerStatus = statusText.toLowerCase();
					if (lowerStatus.includes("ocupado")) status = "busy";
					else if (lowerStatus.includes("logado")) status = "not in use";
					else if (lowerStatus.includes("pausado")) status = "paused";

					if (!result[queueType]) {
						result[queueType] = {};
					}

					result[queueType][nome] = {
						location: sip,
						lastCall: ligacoesAtend || "0",
						status,
						paused: pena || "0",
						auxType: "",
						auxSeconds: "0",
						callFromQueue: fila,
						penalty: pena || "0",
						callerid: numero || "",
						duration: parseDurationToSeconds(duracao)
					};
				});

				return { agents: result };
			});

			logger.log('Dados atualizados com sucesso.');
			return {
				status: {
					success: true
				},
				summary: data,
				agents: agents
			};

		} catch (scrapeError) {
			logger.error('Erro ao tentar extrair dados: ' + scrapeError.message);
		}

	} catch (e) {
		logger.error('Erro ao inicializar extração: ' + e.message);
		context.close();
		browser.close();
	};
};
module.exports.extractApi = extractApi;