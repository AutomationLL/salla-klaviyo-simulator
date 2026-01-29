const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

/**
 * Generates detailed test reports
 */
class Reporter {
    constructor() {
        this.reportsDir = path.join(__dirname, '../../reports');
        this.ensureReportsDir();
    }

    ensureReportsDir() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    /**
     * Generate and save test report
     */
    generateReport(results, scenario) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportName = `${scenario.name}_${timestamp}`;

        // Generate JSON report
        this.saveJSONReport(reportName, results, scenario);

        // Generate Markdown report
        this.saveMarkdownReport(reportName, results, scenario);

        // Print summary to console
        this.printSummary(results, scenario);

        return reportName;
    }

    /**
     * Save JSON report
     */
    saveJSONReport(reportName, results, scenario) {
        const jsonPath = path.join(this.reportsDir, `${reportName}.json`);
        const data = {
            scenario: scenario,
            results: results,
            timestamp: new Date().toISOString()
        };
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        console.log(chalk.gray(`📄 JSON report saved: ${jsonPath}`));
    }

    /**
     * Save Markdown report
     */
    saveMarkdownReport(reportName, results, scenario) {
        const mdPath = path.join(this.reportsDir, `${reportName}.md`);

        let markdown = `# Salla-Klaviyo Integration Test Report\n\n`;
        markdown += `**Date**: ${new Date().toLocaleString()}\n\n`;
        markdown += `## Test Scenario: ${scenario.name}\n\n`;
        markdown += `- **Merchants**: ${scenario.merchantCount}\n`;
        markdown += `- **Requests/sec**: ${scenario.requestsPerSecond}\n`;
        markdown += `- **Duration**: ${scenario.durationSeconds}s\n`;
        markdown += `- **Total Expected Requests**: ${scenario.requestsPerSecond * scenario.durationSeconds}\n\n`;

        markdown += `## Results Summary\n\n`;
        markdown += `| Metric | Value |\n`;
        markdown += `|--------|-------|\n`;
        markdown += `| Total Requests Sent | ${results.totalRequests} |\n`;
        markdown += `| Successful | ${results.successful} (${((results.successful / results.totalRequests) * 100).toFixed(2)}%) |\n`;
        markdown += `| Failed | ${results.failed} (${((results.failed / results.totalRequests) * 100).toFixed(2)}%) |\n`;
        markdown += `| Avg Response Time | ${results.avgResponseTime.toFixed(2)}ms |\n`;
        markdown += `| Min Response Time | ${results.minResponseTime.toFixed(2)}ms |\n`;
        markdown += `| Max Response Time | ${results.maxResponseTime.toFixed(2)}ms |\n`;
        markdown += `| Test Duration | ${results.actualDuration.toFixed(2)}s |\n\n`;

        if (results.merchantBreakdown && results.merchantBreakdown.length > 0) {
            markdown += `## Per-Merchant Breakdown\n\n`;
            markdown += `| Merchant ID | Requests | Success | Failed | Avg Response |\n`;
            markdown += `|-------------|----------|---------|--------|-------------|\n`;
            results.merchantBreakdown.forEach(m => {
                markdown += `| ${m.merchantId} | ${m.total} | ${m.success} | ${m.failed} | ${m.avgResponseTime.toFixed(2)}ms |\n`;
            });
            markdown += `\n`;
        }

        if (results.errors && results.errors.length > 0) {
            markdown += `## Error Details\n\n`;
            const errorCounts = {};
            results.errors.forEach(err => {
                const key = err.message || err.code || 'Unknown error';
                errorCounts[key] = (errorCounts[key] || 0) + 1;
            });

            markdown += `| Error | Count |\n`;
            markdown += `|-------|-------|\n`;
            Object.entries(errorCounts).forEach(([error, count]) => {
                markdown += `| ${error} | ${count} |\n`;
            });
            markdown += `\n`;
        }

        fs.writeFileSync(mdPath, markdown);
        console.log(chalk.gray(`📄 Markdown report saved: ${mdPath}`));
    }

    /**
     * Print summary to console
     */
    printSummary(results, scenario) {
        console.log('\n' + chalk.bold.cyan('═'.repeat(70)));
        console.log(chalk.bold.cyan('  TEST SUMMARY'));
        console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');

        console.log(chalk.bold(`Scenario: ${scenario.name}`));
        console.log(chalk.gray(`Merchants: ${scenario.merchantCount} | RPS: ${scenario.requestsPerSecond} | Duration: ${scenario.durationSeconds}s\n`));

        const successRate = ((results.successful / results.totalRequests) * 100).toFixed(2);
        const successColor = successRate >= 99 ? chalk.green : successRate >= 95 ? chalk.yellow : chalk.red;

        console.log(chalk.bold('Results:'));
        console.log(`  Total Requests:  ${chalk.cyan(results.totalRequests)}`);
        console.log(`  Successful:      ${chalk.green(results.successful)} ${successColor(`(${successRate}%)`)}`);
        console.log(`  Failed:          ${results.failed > 0 ? chalk.red(results.failed) : chalk.gray(results.failed)}`);
        console.log(`  Avg Response:    ${chalk.cyan(results.avgResponseTime.toFixed(2))}ms`);
        console.log(`  Min Response:    ${chalk.cyan(results.minResponseTime.toFixed(2))}ms`);
        console.log(`  Max Response:    ${chalk.cyan(results.maxResponseTime.toFixed(2))}ms`);
        console.log(`  Duration:        ${chalk.cyan(results.actualDuration.toFixed(2))}s\n`);

        if (results.errors && results.errors.length > 0) {
            console.log(chalk.yellow(`⚠ ${results.errors.length} error(s) occurred. Check detailed report for more info.\n`));
        }

        console.log(chalk.bold.cyan('═'.repeat(70)) + '\n');
    }
}

module.exports = Reporter;
