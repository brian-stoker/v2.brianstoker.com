#!/usr/bin/env node

/**
 * This script ensures production builds have the correct environment setup.
 * It sets the NODE_ENV to production and runs the OpenNext build command with
 * the appropriate environment variables.
 *
 * @module build-script
 */

import {spawnSync} from 'child_process';
import path from 'path';
import {fileURLToPath} from 'url';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
/**
 * The directory name of the current module.
 *
 * @constant {string}
 */
const __dirname = path.dirname(__filename);

/**
 * Sets the NODE_ENV environment variable to 'production' to ensure that
 * the application is built with production settings.
 *
 * @function setProductionEnv
 * @returns {void}
 */
function setProductionEnv() {
    process.env.NODE_ENV = 'production';
}

/**
 * Logs the current NODE_ENV setting to the console.
 *
 * @function logEnv
 * @returns {void}
 */
function logEnv() {
    console.log('Building with production settings...');
    console.log('NODE_ENV =', process.env.NODE_ENV);
}

/**
 * Runs the OpenNext build process with the production settings.
 *
 * @function runBuild
 * @returns {void}
 */
function runBuild() {
    // Pinned: @latest can change the build gate unattended. The flag is needed
    // because Next 15 is past the vendor's two-year major support window.
    const result = spawnSync('pnpx', [
        '@opennextjs/aws@4.1.11',
        'build',
        '--dangerously-use-unsupported-next-version'
    ], {
        stdio: 'inherit',
        env: {
            ...process.env,
            NODE_ENV: 'production',
            BABEL_ENV: 'production'
        },
        cwd: path.resolve(__dirname, '..')
    });

    process.exit(result.status);
}

// Execute the functions to set up the environment and run the build
setProductionEnv();
logEnv();
runBuild();
