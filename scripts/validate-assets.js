#!/usr/bin/env node

/**
 * Bridge Battle - Asset Validator
 *
 * Validates sprite assets for common issues:
 * - Checks for missing required sprites
 * - Validates dimensions and aspect ratios
 * - Checks file sizes for mobile optimization
 * - Verifies sprite sheet metadata
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const CONFIG = {
  RAW_ASSETS_DIR: path.join(__dirname, '../raw-assets/ai-generated'),
  MAX_FILE_SIZE_KB: 1024, // Max 1MB per sprite
  RECOMMENDED_FILE_SIZE_KB: 500, // Recommended max 500KB
  POWER_OF_TWO_SIZES: [32, 64, 128, 256, 512, 1024, 2048, 4096]
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
 * Validates a single sprite file
 */
async function validateSprite(filePath) {
  const issues = [];
  const warnings = [];

  try {
    // Get file stats
    const stats = await fs.stat(filePath);
    const sizeKB = Math.round(stats.size / 1024);

    // Check file size
    if (sizeKB > CONFIG.MAX_FILE_SIZE_KB) {
      issues.push(`File too large: ${sizeKB}KB (max ${CONFIG.MAX_FILE_SIZE_KB}KB)`);
    } else if (sizeKB > CONFIG.RECOMMENDED_FILE_SIZE_KB) {
      warnings.push(`File larger than recommended: ${sizeKB}KB (recommended max ${CONFIG.RECOMMENDED_FILE_SIZE_KB}KB)`);
    }

    // Get image metadata
    const metadata = await sharp(filePath).metadata();

    // Check if dimensions are reasonable
    if (metadata.width > 4096 || metadata.height > 4096) {
      issues.push(`Dimensions too large: ${metadata.width}x${metadata.height} (max 4096x4096)`);
    }

    // Check if dimensions are power of two (optional, but recommended for GPU)
    const isPowerOfTwo = (n) => n && (n & (n - 1)) === 0;
    if (!isPowerOfTwo(metadata.width) || !isPowerOfTwo(metadata.height)) {
      warnings.push(`Non-power-of-two dimensions: ${metadata.width}x${metadata.height} (may impact GPU performance)`);
    }

    // Check if image has alpha channel (should for sprites)
    if (metadata.channels < 4) {
      warnings.push(`No alpha channel detected (transparency may not work)`);
    }

    return {
      file: path.basename(filePath),
      path: filePath,
      size: sizeKB,
      dimensions: `${metadata.width}x${metadata.height}`,
      format: metadata.format,
      channels: metadata.channels,
      issues: issues,
      warnings: warnings,
      valid: issues.length === 0
    };

  } catch (error) {
    return {
      file: path.basename(filePath),
      path: filePath,
      issues: [`Error reading file: ${error.message}`],
      warnings: [],
      valid: false
    };
  }
}

/**
 * Checks required sprite categories
 */
async function checkRequiredCategories() {
  log('\n📋 Checking required categories...', 'cyan');

  const requiredCategories = [
    { name: 'characters', required: true },
    { name: 'enemies', required: true },
    { name: 'obstacles', required: true },
    { name: 'gates', required: true },
    { name: 'ui', required: false },
    { name: 'effects', required: false },
    { name: 'weapons', required: false },
    { name: 'backgrounds', required: false }
  ];

  const results = [];

  for (const category of requiredCategories) {
    const categoryPath = path.join(CONFIG.RAW_ASSETS_DIR, category.name);

    try {
      await fs.access(categoryPath);
      const files = await glob(path.join(categoryPath, '**/*.{png,jpg,jpeg,webp}'));

      const status = files.length > 0 ? 'green' : 'yellow';
      const icon = files.length > 0 ? '✓' : '⚠';

      log(`   ${icon} ${category.name}: ${files.length} files`, status);

      results.push({
        category: category.name,
        exists: true,
        fileCount: files.length,
        required: category.required,
        complete: files.length > 0
      });

    } catch (error) {
      const status = category.required ? 'red' : 'yellow';
      const icon = category.required ? '✗' : '⚠';

      log(`   ${icon} ${category.name}: Not found${category.required ? ' (REQUIRED)' : ''}`, status);

      results.push({
        category: category.name,
        exists: false,
        fileCount: 0,
        required: category.required,
        complete: false
      });
    }
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('✅ Bridge Battle - Asset Validator', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    // Check required categories
    const categoryResults = await checkRequiredCategories();

    // Find all sprites
    const patterns = [
      `${CONFIG.RAW_ASSETS_DIR}/**/*.png`,
      `${CONFIG.RAW_ASSETS_DIR}/**/*.jpg`,
      `${CONFIG.RAW_ASSETS_DIR}/**/*.jpeg`,
      `${CONFIG.RAW_ASSETS_DIR}/**/*.webp`
    ];

    let files = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern);
      files.push(...matches);
    }

    if (files.length === 0) {
      log('\n⚠️  No sprite files found', 'yellow');
      log('\n💡 Add sprites to raw-assets/ai-generated/ and run validation again\n', 'cyan');
      return;
    }

    log(`\n🔍 Validating ${files.length} sprite files...\n`, 'cyan');

    // Validate each sprite
    const results = [];
    let totalIssues = 0;
    let totalWarnings = 0;

    for (const file of files) {
      const result = await validateSprite(file);
      results.push(result);

      if (result.issues.length > 0) {
        totalIssues += result.issues.length;
        log(`   ✗ ${result.file}`, 'red');
        result.issues.forEach(issue => {
          log(`      • ${issue}`, 'red');
        });
      } else if (result.warnings.length > 0) {
        totalWarnings += result.warnings.length;
        log(`   ⚠ ${result.file}`, 'yellow');
        result.warnings.forEach(warning => {
          log(`      • ${warning}`, 'yellow');
        });
      } else {
        log(`   ✓ ${result.file} (${result.size}KB, ${result.dimensions})`, 'green');
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 Validation Summary', 'bright');
    log('='.repeat(60) + '\n', 'cyan');

    const validFiles = results.filter(r => r.valid).length;
    const filesWithIssues = results.filter(r => r.issues.length > 0).length;
    const filesWithWarnings = results.filter(r => r.warnings.length > 0 && r.issues.length === 0).length;

    log(`   Total files: ${results.length}`, 'cyan');
    log(`   Valid: ${validFiles}`, 'green');
    log(`   Warnings: ${filesWithWarnings}`, 'yellow');
    log(`   Issues: ${filesWithIssues}`, filesWithIssues > 0 ? 'red' : 'green');

    const missingRequired = categoryResults.filter(c => c.required && !c.complete);
    if (missingRequired.length > 0) {
      log(`\n   Missing required categories:`, 'red');
      missingRequired.forEach(c => {
        log(`      • ${c.category}`, 'red');
      });
    }

    if (filesWithIssues === 0 && missingRequired.length === 0) {
      log('\n✅ All sprites validated successfully!\n', 'green');
    } else {
      log('\n⚠️  Please fix the issues above before proceeding\n', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSprite, checkRequiredCategories };
