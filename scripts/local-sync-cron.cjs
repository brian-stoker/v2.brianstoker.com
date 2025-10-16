#!/usr/bin/env node

/**
 * Local GitHub Events Sync Cron
 * Runs every hour to sync GitHub events to MongoDB
 * For development/testing only - production uses AWS EventBridge
 */

const https = require('https');
const http = require('http');
require('dotenv').config();

const SYNC_ENDPOINT = process.env.SYNC_ENDPOINT || 'http://localhost:5040/api/github/sync-events';
const SYNC_SECRET = process.env.SYNC_SECRET;
const INTERVAL_HOURS = 1;

if (!SYNC_SECRET) {
  console.error('❌ SYNC_SECRET environment variable is required');
  process.exit(1);
}

function callSyncEndpoint() {
  const url = new URL(SYNC_ENDPOINT);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;

  // Add fullRefresh query param if FULL_REFRESH env var is set
  const fullRefresh = process.env.FULL_REFRESH === 'true';
  const path = fullRefresh ? `${url.pathname}?fullRefresh=true` : url.pathname;

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: path,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SYNC_SECRET}`,
      'Content-Type': 'application/json'
    },
    timeout: 180000 // 3 minute timeout
  };

  if (fullRefresh) {
    console.log(`   Mode: FULL REFRESH`);
  }

  console.log(`\n🔄 [${new Date().toLocaleString()}] Triggering sync...`);
  console.log(`   Endpoint: ${SYNC_ENDPOINT}`);

  const req = client.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const result = JSON.parse(data);
          console.log(`✅ Sync successful!`);
          console.log(`   Mode: ${result.mode || 'unknown'}`);
          console.log(`   New events: ${result.newEventCount || result.eventCount || 0}`);
          if (result.duplicatesSkipped > 0) {
            console.log(`   Duplicates skipped: ${result.duplicatesSkipped}`);
          }
          console.log(`   Total in DB: ${result.totalEventsInDb || 'unknown'}`);
          console.log(`   Pages checked: ${result.pagesChecked || result.pages || 0}`);
          console.log(`   Next sync: ${new Date(Date.now() + INTERVAL_HOURS * 60 * 60 * 1000).toLocaleString()}`);
        } catch (err) {
          console.log(`✅ Sync completed (status ${res.statusCode})`);
          console.log(`   Response: ${data}`);
        }
      } else {
        console.error(`❌ Sync failed with status ${res.statusCode}`);
        console.error(`   Response: ${data}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error(`❌ Request error: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.error(`   Make sure the dev server is running on ${SYNC_ENDPOINT}`);
    }
  });

  req.on('timeout', () => {
    console.error('❌ Request timeout (exceeded 3 minutes)');
    req.destroy();
  });

  req.end();
}

// Run immediately on start
console.log('🚀 Local GitHub Sync Cron Started');
console.log(`   Interval: Every ${INTERVAL_HOURS} hour(s)`);
console.log(`   Endpoint: ${SYNC_ENDPOINT}`);
console.log(`   Press Ctrl+C to stop\n`);

callSyncEndpoint();

// Then run every hour
const intervalMs = INTERVAL_HOURS * 60 * 60 * 1000;
setInterval(callSyncEndpoint, intervalMs);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Stopping local sync cron...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Stopping local sync cron...');
  process.exit(0);
});
