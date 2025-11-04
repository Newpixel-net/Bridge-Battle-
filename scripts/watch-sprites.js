#!/usr/bin/env node

/**
 * Bridge Battle - Sprite Watcher
 *
 * Watches raw-assets folder for new sprites and automatically processes them:
 * - Detects new files added to raw-assets/ai-generated/
 * - Automatically processes new sprites
 * - Packs sprite sheets from {tps} folders
 * - Provides real-time feedback
 */

const chokidar = require('chokidar');
const path = require('path');
const { processSprite } = require('./process-sprites');
const { packSpriteSheet } = require('./pack-sprite-sheets');

const CONFIG = {
  WATCH_DIR: path.join(__dirname, '../raw-assets/ai-generated'),
  DEBOUNCE_MS: 1000
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// Track processed files to avoid duplicates
const processedFiles = new Set();
const processingQueue = new Map();

/**
 * Processes a newly added sprite
 */
async function handleNewSprite(filePath) {
  // Skip if already processed recently
  if (processedFiles.has(filePath)) {
    return;
  }

  // Skip non-image files
  const ext = path.extname(filePath).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
    return;
  }

  log(`New sprite detected: ${path.basename(filePath)}`, 'blue');

  try {
    await processSprite(filePath);
    processedFiles.add(filePath);
    log(`✓ Processed: ${path.basename(filePath)}`, 'green');

    // Check if this is in a {tps} folder
    if (filePath.includes('{tps}')) {
      const folderPath = path.dirname(filePath);

      // Debounce sprite sheet packing (wait for all frames to be added)
      if (processingQueue.has(folderPath)) {
        clearTimeout(processingQueue.get(folderPath));
      }

      const timeout = setTimeout(async () => {
        log(`Packing sprite sheet for: ${path.basename(folderPath)}`, 'magenta');
        try {
          await packSpriteSheet(folderPath);
          log(`✓ Sprite sheet packed: ${path.basename(folderPath)}`, 'green');
        } catch (error) {
          log(`✗ Error packing sprite sheet: ${error.message}`, 'red');
        }
        processingQueue.delete(folderPath);
      }, CONFIG.DEBOUNCE_MS);

      processingQueue.set(folderPath, timeout);
    }

  } catch (error) {
    log(`✗ Error processing sprite: ${error.message}`, 'red');
  }
}

/**
 * Main execution
 */
function main() {
  log('='.repeat(60), 'cyan');
  log('👁️  Bridge Battle - Sprite Watcher', 'bright');
  log('='.repeat(60), 'cyan');
  log(`Watching: ${CONFIG.WATCH_DIR}`, 'cyan');
  log('Add sprites to raw-assets/ai-generated/ to auto-process', 'cyan');
  log('Press Ctrl+C to stop\n', 'yellow');

  // Initialize watcher
  const watcher = chokidar.watch(CONFIG.WATCH_DIR, {
    ignored: /(^|[\/\\])\../, // Ignore hidden files
    persistent: true,
    ignoreInitial: true, // Don't process existing files on startup
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  // Set up event handlers
  watcher
    .on('add', handleNewSprite)
    .on('ready', () => {
      log('✓ Watcher ready. Waiting for new sprites...', 'green');
    })
    .on('error', error => {
      log(`Watcher error: ${error}`, 'red');
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\nShutting down watcher...', 'yellow');
    watcher.close();
    process.exit(0);
  });
}

if (require.main === module) {
  main();
}
