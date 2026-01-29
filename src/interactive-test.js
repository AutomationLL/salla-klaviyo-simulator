require('dotenv').config();
const axios = require('axios');
const readlineSync = require('readline-sync');
const SallaWebhookGenerator = require('./generators/salla-webhook-generator');
const Logger = require('./utils/logger');

/**
 * Interactive testing tool for simulating the merchant journey
 */
async function runInteractive() {
    const logger = new Logger('[SIMULATOR] ');
    const generator = new SallaWebhookGenerator();
    const endpoint = process.env.WEBHOOK_ENDPOINT || 'https://track.hydralyte-sa.com/data';

    logger.header('SALLA-KLAVIYO MERCHANT SIMULATOR');

    // 1. Get Merchant Info
    const merchantId = readlineSync.question('Enter Merchant ID (default: merchant_interactive_001): ') || 'merchant_interactive_001';
    const privateKey = readlineSync.question('Enter Klaviyo Private Key (pk_...): ');

    if (!privateKey) {
        logger.error('Private key is required to test the integration.');
        return;
    }

    logger.info(`Target Endpoint: ${endpoint}`);
    logger.info(`Active Merchant: ${merchantId}`);
    logger.divider();

    let exit = false;
    while (!exit) {
        console.log('\n--- CHOOSE AN ACTION ---');
        console.log('1. [INSTALL] Send App Installed Webhook (Sync Key to DB)');
        console.log('2. [PURCHASE] Send Fake Order Created Webhook');
        console.log('3. [CUSTOMER] Send Fake Customer Created Webhook');
        console.log('4. [STRESS] Run Scalability Test (100 fast orders)');
        console.log('5. Change Merchant/Key');
        console.log('0. Exit');

        const choice = readlineSync.question('\nSelect an option: ');

        try {
            switch (choice) {
                case '1':
                    logger.info('Simulating app.installed event...');
                    // Custom installation payload including the private key
                    const installPayload = {
                        event: 'app.installed',
                        merchant: merchantId,
                        data: {
                            settings: {
                                klaviyo_private_key: privateKey
                            }
                        }
                    };
                    await sendPayload(endpoint, installPayload, logger);
                    break;

                case '2':
                    logger.info('Generating fake order.created...');
                    const orderPayload = generator.generateOrderCreated(merchantId);
                    await sendPayload(endpoint, orderPayload, logger);
                    break;

                case '3':
                    logger.info('Generating fake customer.created...');
                    const customerPayload = generator.generateCustomerCreated(merchantId);
                    await sendPayload(endpoint, customerPayload, logger);
                    break;

                case '4':
                    const count = 100;
                    logger.warning(`Firing ${count} orders immediately...`);
                    const promises = [];
                    for (let i = 0; i < count; i++) {
                        promises.push(sendPayload(endpoint, generator.generateOrderCreated(merchantId), null));
                    }
                    await Promise.all(promises);
                    logger.success(`Sent ${count} orders successfully.`);
                    break;

                case '5':
                    return runInteractive(); // Restart

                case '0':
                    exit = true;
                    break;

                default:
                    logger.warning('Invalid option.');
            }
        } catch (err) {
            logger.error('Error during action: ' + err.message);
        }
    }

    logger.success('Simulator closed.');
}

async function sendPayload(url, payload, logger) {
    try {
        const res = await axios.post(url, payload, { timeout: 10000 });
        if (logger) {
            logger.success(`Sent ${payload.event} | Server responded: ${res.status}`);
        }
        return res;
    } catch (err) {
        if (logger) {
            logger.error(`Failed to send ${payload.event}: ${err.message}`);
            if (err.response) logger.debug(`Response: ${JSON.stringify(err.response.data)}`);
        }
        throw err;
    }
}

if (require.main === module) {
    runInteractive();
}
