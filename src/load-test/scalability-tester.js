require('dotenv').config();
const axios = require('axios');
const SallaWebhookGenerator = require('../generators/salla-webhook-generator');
const Logger = require('../utils/logger');
const Reporter = require('../utils/reporter');
const { getScenario, listScenarios } = require('./test-scenarios');

/**
 * Main scalability testing tool
 */
class ScalabilityTester {
    constructor(scenario) {
        this.scenario = scenario;
        this.webhookGenerator = new SallaWebhookGenerator();
        this.logger = new Logger('[TESTER] ');
        this.reporter = new Reporter();
        this.endpoint = process.env.WEBHOOK_ENDPOINT || 'https://track.hydralyte-sa.com/data';

        // Generate test merchant IDs
        this.merchantIds = this.generateMerchantIds(scenario.merchantCount);

        // Results tracking
        this.results = {
            totalRequests: 0,
            successful: 0,
            failed: 0,
            responseTimes: [],
            errors: [],
            merchantStats: {},
            startTime: null,
            endTime: null
        };
    }

    /**
     * Generate unique merchant IDs for testing
     */
    generateMerchantIds(count) {
        const merchants = [];
        for (let i = 1; i <= count; i++) {
            merchants.push(`merchant_${i.toString().padStart(4, '0')}`);
        }
        return merchants;
    }

    /**
     * Get random merchant ID
     */
    getRandomMerchant() {
        return this.merchantIds[Math.floor(Math.random() * this.merchantIds.length)];
    }

    /**
     * Send single webhook request
     */
    async sendWebhookRequest(merchantId) {
        const startTime = Date.now();

        try {
            const payload = this.webhookGenerator.generateRandomEvent(merchantId);

            const response = await axios.post(this.endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Salla-Webhook-Test/1.0'
                },
                timeout: 10000 // 10 second timeout
            });

            const responseTime = Date.now() - startTime;

            return {
                success: true,
                responseTime,
                merchantId,
                statusCode: response.status,
                event: payload.event
            };

        } catch (error) {
            const responseTime = Date.now() - startTime;

            return {
                success: false,
                responseTime,
                merchantId,
                error: error.message,
                statusCode: error.response?.status,
                event: null
            };
        }
    }

    /**
     * Track request result
     */
    trackResult(result) {
        this.results.totalRequests++;

        if (result.success) {
            this.results.successful++;
        } else {
            this.results.failed++;
            this.results.errors.push({
                merchantId: result.merchantId,
                error: result.error,
                statusCode: result.statusCode,
                timestamp: new Date().toISOString()
            });
        }

        this.results.responseTimes.push(result.responseTime);

        // Track per-merchant stats
        if (!this.results.merchantStats[result.merchantId]) {
            this.results.merchantStats[result.merchantId] = {
                total: 0,
                success: 0,
                failed: 0,
                responseTimes: []
            };
        }

        const merchantStat = this.results.merchantStats[result.merchantId];
        merchantStat.total++;
        if (result.success) {
            merchantStat.success++;
        } else {
            merchantStat.failed++;
        }
        merchantStat.responseTimes.push(result.responseTime);
    }

    /**
     * Run load test
     */
    async runTest() {
        this.logger.header(`SALLA-KLAVIYO SCALABILITY TEST: ${this.scenario.name}`);

        this.logger.info(`Endpoint: ${this.endpoint}`);
        this.logger.info(`Merchants: ${this.scenario.merchantCount}`);
        this.logger.info(`Target RPS: ${this.scenario.requestsPerSecond}`);
        this.logger.info(`Duration: ${this.scenario.durationSeconds}s`);
        this.logger.divider();

        // Display merchant IDs
        this.logger.info(`Test Merchant IDs:`);
        this.merchantIds.slice(0, 5).forEach(mid => {
            this.logger.debug(`  - ${mid}`);
        });
        if (this.merchantIds.length > 5) {
            this.logger.debug(`  ... and ${this.merchantIds.length - 5} more`);
        }
        this.logger.divider();

        this.logger.warning('Starting load test in 3 seconds...');
        await this.sleep(3000);

        this.results.startTime = Date.now();
        this.logger.success('🚀 Test started!\n');

        // Calculate interval between requests
        const intervalMs = 1000 / this.scenario.requestsPerSecond;
        const endTime = Date.now() + (this.scenario.durationSeconds * 1000);

        let requestCount = 0;
        const progressInterval = setInterval(() => {
            const elapsed = ((Date.now() - this.results.startTime) / 1000).toFixed(1);
            const rate = (this.results.totalRequests / elapsed).toFixed(1);
            this.logger.info(
                `${elapsed}s | Requests: ${this.results.totalRequests} | ` +
                `Success: ${this.results.successful} | Failed: ${this.results.failed} | ` +
                `Rate: ${rate} req/s`
            );
        }, 2000);

        // Send requests at specified rate
        while (Date.now() < endTime) {
            const merchantId = this.getRandomMerchant();

            // Send request (don't await - fire and forget for load testing)
            this.sendWebhookRequest(merchantId).then(result => {
                this.trackResult(result);
            });

            requestCount++;

            // Sleep to maintain target rate
            await this.sleep(intervalMs);
        }

        clearInterval(progressInterval);

        // Wait for all pending requests to complete
        this.logger.warning('\nWaiting for pending requests to complete...');
        await this.sleep(5000);

        this.results.endTime = Date.now();

        // Calculate final metrics
        return this.generateFinalReport();
    }

    /**
     * Generate final report
     */
    generateFinalReport() {
        const actualDuration = (this.results.endTime - this.results.startTime) / 1000;

        const finalResults = {
            totalRequests: this.results.totalRequests,
            successful: this.results.successful,
            failed: this.results.failed,
            avgResponseTime: this.average(this.results.responseTimes),
            minResponseTime: Math.min(...this.results.responseTimes),
            maxResponseTime: Math.max(...this.results.responseTimes),
            actualDuration: actualDuration,
            actualRPS: this.results.totalRequests / actualDuration,
            errors: this.results.errors,
            merchantBreakdown: this.getMerchantBreakdown()
        };

        // Generate report
        this.reporter.generateReport(finalResults, this.scenario);

        return finalResults;
    }

    /**
     * Get per-merchant breakdown
     */
    getMerchantBreakdown() {
        return Object.entries(this.results.merchantStats).map(([merchantId, stats]) => ({
            merchantId,
            total: stats.total,
            success: stats.success,
            failed: stats.failed,
            avgResponseTime: this.average(stats.responseTimes)
        }));
    }

    /**
     * Calculate average
     */
    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Main execution
 */
async function main() {
    const scenarioName = process.argv[2] || 'light';

    if (scenarioName === 'list') {
        console.log('\nAvailable test scenarios:\n');
        listScenarios().forEach(s => {
            console.log(`  ${s.key.padEnd(10)} - ${s.description}`);
            console.log(`              ${s.merchantCount} merchants, ${s.requestsPerSecond} req/s, ${s.durationSeconds}s\n`);
        });
        return;
    }

    try {
        const scenario = getScenario(scenarioName);
        const tester = new ScalabilityTester(scenario);
        await tester.runTest();
    } catch (error) {
        console.error('Error running test:', error.message);
        process.exit(1);
    }
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = ScalabilityTester;
