#!/usr/bin/env node

/**
 * Bridge Battle - Sprite Optimizer
 *
 * Additional optimization for mobile performance:
 * - Compresses images for smaller file sizes
 * - Removes unnecessary metadata
 * - Applies lossy compression where acceptable
 * - Generates optimized copies for production
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const CONFIG = {
  PROCESSED_DIR: path.join(__dirname, '../processed-assets'),
  OPTIMIZED_DIR: path.join(__dirname, '../processed-assets/optimized'),
  OPTIMIZATION_LEVEL: {
    png: {
      compressionLevel: 9,
      quality: 90,
      effort: 10
    },
    webp: {
      quality: 80,
      effort: 6,
      nearLossless: true
    }
  },
  TARGET_MAX_SIZE_KB: 500 // Target max file size
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Optimizes a single sprite
 */
async function optimizeSprite(inputPath) {
  const relativePath = path.relative(CONFIG.PROCESSED_DIR, inputPath);
  const parsed = path.parse(relativePath);
  const ext = parsed.ext.toLowerCase();

  const outputDir = path.join(CONFIG.OPTIMIZED_DIR, parsed.dir);
  await fs.mkdir(outputDir, { recursive: true });

  const outputPath = path.join(outputDir, parsed.base);

  try {
    let pipeline = sharp(inputPath);

    if (ext === '.png') {
      pipeline = pipeline.png(CONFIG.OPTIMIZATION_LEVEL.png);
    } else if (ext === '.webp') {
      pipeline = pipeline.webp(CONFIG.OPTIMIZATION_LEVEL.webp);
    }

    await pipeline.toFile(outputPath);

    // Get file sizes
    const originalStats = await fs.stat(inputPath);
    const optimizedStats = await fs.stat(outputPath);

    const originalSize = originalStats.size;
    const optimizedSize = optimizedStats.size;
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

    return {
      file: parsed.base,
      originalSize: Math.round(originalSize / 1024),
      optimizedSize: Math.round(optimizedSize / 1024),
      savings: Math.round(savings / 1024),
      savingsPercent: savingsPercent,
      outputPath: outputPath
    };

  } catch (error) {
    log(`   ⚠️  Error optimizing ${parsed.base}: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Main execution
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('⚡ Bridge Battle - Sprite Optimizer', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    // Find all processed sprites
    const patterns = [
      `${CONFIG.PROCESSED_DIR}/individual/**/*.png`,
      `${CONFIG.PROCESSED_DIR}/individual/**/*.webp`,
      `${CONFIG.PROCESSED_DIR}/sprite-sheets/**/*.png`,
      `${CONFIG.PROCESSED_DIR}/sprite-sheets/**/*.webp`
    ];

    let files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern);
      files.push(...matches);
    }

    if (files.length === 0) {
      log('⚠️  No sprites found to optimize', 'yellow');
      log('\n💡 Run "npm run process" first to process raw sprites\n', 'cyan');
      return;
    }

    log(`🔍 Found ${files.length} files to optimize\n`, 'cyan');

    const results = [];
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;

    for (const file of files) {
      const result = await optimizeSprite(file);
      if (result) {
        results.push(result);
        totalOriginalSize += result.originalSize;
        totalOptimizedSize += result.optimizedSize;

        const color = result.savingsPercent > 20 ? 'green' : result.savingsPercent > 10 ? 'yellow' : 'blue';
        log(`   ${result.file}`, 'blue');
        log(`      ${result.originalSize}KB → ${result.optimizedSize}KB (saved ${result.savingsPercent}%)`, color);
      }
    }

    const totalSavings = totalOriginalSize - totalOptimizedSize;
    const totalSavingsPercent = ((totalSavings / totalOriginalSize) * 100).toFixed(1);

    // Summary
    log('\n' + '='.repeat(60), 'green');
    log('✅ Optimization Complete!', 'bright');
    log('='.repeat(60), 'green');
    log(`\n   Files optimized: ${results.length}`, 'green');
    log(`   Original size: ${totalOriginalSize}KB`, 'yellow');
    log(`   Optimized size: ${totalOptimizedSize}KB`, 'green');
    log(`   Total savings: ${totalSavings}KB (${totalSavingsPercent}%)`, 'bright');
    log(`\n   Output: ${CONFIG.OPTIMIZED_DIR}/\n`, 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { optimizeSprite };
