require('dotenv').config();
const axios = require('axios');
const SallaWebhookGenerator = require('./generators/salla-webhook-generator');
const Logger = require('./utils/logger');

async function testConnection() {
    const logger = new Logger('[CONNECT] ');
    const generator = new SallaWebhookGenerator();
    const endpoint = process.env.WEBHOOK_ENDPOINT;

    logger.header('TESTING ENDPOINT CONNECTION');
    logger.info(`Endpoint: ${endpoint}`);

    const payload = generator.generateOrderCreated('test_merchant_001');

    try {
        logger.info('Sending test order.created payload...');
        const response = await axios.post(endpoint, payload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });

        logger.success(`Success! Status: ${response.status} ${response.statusText}`);
        logger.debug('Response data: ' + JSON.stringify(response.data));

    } catch (error) {
        logger.error('Connection failed!');
        if (error.response) {
            logger.error(`Status: ${error.response.status}`);
            logger.error('Details: ' + JSON.stringify(error.response.data));
        } else {
            logger.error(error.message);
        }
        process.exit(1);
    }
}

if (require.main === module) {
    testConnection();
}
