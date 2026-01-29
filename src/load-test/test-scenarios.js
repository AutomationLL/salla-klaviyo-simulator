/**
 * Predefined test scenarios for different load levels
 */

const scenarios = {
    light: {
        name: 'Light Load',
        merchantCount: 5,
        requestsPerSecond: 10,
        durationSeconds: 30,
        description: 'Low traffic simulation with 5 merchants'
    },

    medium: {
        name: 'Medium Load',
        merchantCount: 10,
        requestsPerSecond: 50,
        durationSeconds: 60,
        description: 'Moderate traffic simulation with 10 merchants'
    },

    heavy: {
        name: 'Heavy Load',
        merchantCount: 20,
        requestsPerSecond: 100,
        durationSeconds: 60,
        description: 'High traffic simulation with 20 merchants'
    },

    stress: {
        name: 'Stress Test',
        merchantCount: 50,
        requestsPerSecond: 200,
        durationSeconds: 120,
        description: 'Maximum load stress test with 50 merchants'
    },

    custom: {
        name: 'Custom Test',
        merchantCount: parseInt(process.env.MERCHANT_COUNT) || 10,
        requestsPerSecond: parseInt(process.env.REQUESTS_PER_SECOND) || 50,
        durationSeconds: parseInt(process.env.DURATION_SECONDS) || 60,
        description: 'Custom configuration from environment variables'
    }
};

/**
 * Get scenario by name
 */
function getScenario(scenarioName) {
    const scenario = scenarios[scenarioName.toLowerCase()];
    if (!scenario) {
        throw new Error(`Unknown scenario: ${scenarioName}. Available: ${Object.keys(scenarios).join(', ')}`);
    }
    return scenario;
}

/**
 * List all available scenarios
 */
function listScenarios() {
    return Object.entries(scenarios).map(([key, value]) => ({
        key,
        ...value
    }));
}

module.exports = {
    scenarios,
    getScenario,
    listScenarios
};
