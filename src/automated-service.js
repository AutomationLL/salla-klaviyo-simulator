require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');
const SallaWebhookGenerator = require('./generators/salla-webhook-generator');
const Logger = require('./utils/logger');

/**
 * Automated Service Account Simulator
 * Simulates:
 * 1. App Installation (Merchant + Private Key Sync)
 * 2. Order Creation (Webhook Event)
 */
async function runAutomatedTest() {
    const logger = new Logger('[SERVICE-ACCOUNT] ');
    const generator = new SallaWebhookGenerator();
    const endpoint = process.env.WEBHOOK_ENDPOINT || 'https://track.hydralyte-sa.com/data';

    // 1. Generate Fake Merchant Identity (SIMULATING SALLA)
    const merchantId = `mer_${crypto.randomBytes(4).toString('hex')}`;

    // THE PRIVATE KEY: You can set this in .env or it uses this test one
    const privateKey = process.env.KLAVIYO_PRIVATE_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY';

    logger.info(`Session Identities:`);
    logger.debug(`  - Merchant ID (from Salla): ${merchantId}`);
    logger.debug(`  - Klaviyo Private Key (from you): ${privateKey}`);
    logger.divider();

    try {
        // ---- STEP 1: AUTHORIZATION (INSTALLATION) ----
        // Salla sends app.store.authorize when a merchant installs the app.
        logger.info('STEP 1: Simulating [app.store.authorize] webhook...');
        const installPayload = generator.generateAppStoreAuthorize(merchantId);

        const installRes = await sendPayload(endpoint, installPayload, logger);

        if (installRes.status >= 200 && installRes.status < 300) {
            logger.success('Authorization synced successfully.');
        } else {
            logger.warning(`Authorization returned status: ${installRes.status}`);
        }

        logger.divider();
        logger.info('Waiting 1.5 seconds for access tokens...');
        await new Promise(r => setTimeout(r, 1500));

        // ---- STEP 1b: SETTINGS UPDATE (PRIVATE KEY SYNC) ----
        // After installation, the merchant enters their private key in the app settings dashboard.
        logger.info('STEP 1b: Simulating [app.settings.updated] (Private Key Sync)...');
        const settingsPayload = generator.generateAppSettingsUpdated(merchantId, privateKey);
        const settingsRes = await sendPayload(endpoint, settingsPayload, logger);

        if (settingsRes.status >= 200 && settingsRes.status < 300) {
            logger.success('Private key and metadata synced to Firestore!');
        } else {
            logger.warning(`Settings update returned status: ${settingsRes.status}`);
        }

        logger.divider();
        logger.info('Waiting 1.5 seconds for DB consistency...');
        await new Promise(r => setTimeout(r, 1500));

        // ---- STEP 2: CUSTOMER CREATION ----
        logger.info('STEP 2: Simulating [customer.created] webhook...');
        const customerPayload = generator.generateCustomerCreated(merchantId);
        const customerRes = await sendPayload(endpoint, customerPayload, logger);

        if (customerRes.status >= 200 && customerRes.status < 300) {
            logger.success('Customer creation processed.');
        }

        logger.divider();
        logger.info('Waiting 1 second...');
        await new Promise(r => setTimeout(r, 1000));

        // ---- STEP 3: PURCHASE EVENT ----
        logger.info('STEP 3: Simulating [order.created] webhook...');
        const orderPayload = generator.generateOrderCreated(merchantId);
        const purchaseRes = await sendPayload(endpoint, orderPayload, logger);

        if (purchaseRes.status >= 200 && purchaseRes.status < 300) {
            logger.success('Purchase event processed successfully.');
        }

        logger.divider();
        logger.success('INTEGRATION TEST COMPLETE');
        logger.info(`Results:`);
        logger.info(`  - Salla Merchant ID: ${merchantId}`);
        logger.info(`  - Private Key Used: ${privateKey}`);
        logger.info('Verify that the key was written to Firestore and data reached Klaviyo.');

    } catch (err) {
        logger.error('Test Failed: ' + err.message);
        if (err.response) {
            logger.debug('Error Data: ' + JSON.stringify(err.response.data));
        }
    }
}

async function sendPayload(url, payload, logger) {
    try {
        const res = await axios.post(url, payload, {
            headers: {
                'Content-Type': 'application/json',
                'X-Salla-Event': payload.event,
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'X-Gtm-Server-Preview': process.env.GTM_PREVIEW_HEADER || '', // Helpful for GTM Debugging
            },
            timeout: 15000
        });

        if (logger) {
            logger.debug(`[${payload.event}] -> HTTP ${res.status}`);
            logger.debug(`Server Header: ${res.headers['server'] || 'Unknown'}`);
            if (res.headers['x-gtm-server-side']) {
                logger.success(`Confirmed: Request reached an S-GTM container!`);
            }
        }
        return res;
    } catch (err) {
        throw err;
    }
}

if (require.main === module) {
    runAutomatedTest();
}
