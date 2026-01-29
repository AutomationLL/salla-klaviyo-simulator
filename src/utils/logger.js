const chalk = require('chalk');

/**
 * Structured logger with color-coded output
 */
class Logger {
    constructor(prefix = '') {
        this.prefix = prefix;
    }

    info(message) {
        console.log(chalk.blue(`ℹ ${this.prefix}${message}`));
    }

    success(message) {
        console.log(chalk.green(`✓ ${this.prefix}${message}`));
    }

    warning(message) {
        console.log(chalk.yellow(`⚠ ${this.prefix}${message}`));
    }

    error(message) {
        console.log(chalk.red(`✗ ${this.prefix}${message}`));
    }

    debug(message) {
        console.log(chalk.gray(`• ${this.prefix}${message}`));
    }

    header(message) {
        console.log('\n' + chalk.bold.cyan(`${'='.repeat(60)}`));
        console.log(chalk.bold.cyan(`  ${message}`));
        console.log(chalk.bold.cyan(`${'='.repeat(60)}`) + '\n');
    }

    divider() {
        console.log(chalk.gray('-'.repeat(60)));
    }
}

module.exports = Logger;
