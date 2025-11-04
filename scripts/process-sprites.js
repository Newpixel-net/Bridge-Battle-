#!/usr/bin/env node

/**
 * Bridge Battle - Sprite Processing Pipeline
 *
 * Main script that orchestrates the entire sprite processing workflow:
 * 1. Scans raw-assets folder for new sprites
 * 2. Packs sprite sheets from {tps} tagged folders
 * 3. Optimizes images for mobile performance
 * 4. Generates multiple resolutions (1x, 2x, 4x)
 * 5. Creates metadata JSON files
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

// Configuration
const CONFIG = {
  RAW_ASSETS_DIR: path.join(__dirname, '../raw-assets/ai-generated'),
  PROCESSED_DIR: path.join(__dirname, '../processed-assets'),
  RESOLUTIONS: [
    { suffix: '', scale: 1 },     // Base resolution
    { suffix: '@2x', scale: 2 },  // Retina
    { suffix: '@4x', scale: 4 }   // Ultra HD
  ],
  FORMATS: ['png', 'webp'],
  QUALITY: {
    png: { compressionLevel: 9 },
    webp: { quality: 85, effort: 6 }
  }
};

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Scans for all image files in raw-assets directory
 */
async function findAllSprites() {
  log('\n🔍 Scanning for sprites...', 'cyan');

  const patterns = [
    `${CONFIG.RAW_ASSETS_DIR}/**/*.png`,
    `${CONFIG.RAW_ASSETS_DIR}/**/*.jpg`,
    `${CONFIG.RAW_ASSETS_DIR}/**/*.jpeg`,
    `${CONFIG.RAW_ASSETS_DIR}/**/*.webp`
  ];

  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern);
    files.push(...matches);
  }

  log(`   Found ${files.length} sprite files`, 'green');
  return files;
}

/**
 * Processes a single sprite: resizes and optimizes for multiple resolutions
 */
async function processSprite(inputPath) {
  const relativePath = path.relative(CONFIG.RAW_ASSETS_DIR, inputPath);
  const parsedPath = path.parse(relativePath);
  const category = parsedPath.dir.split(path.sep)[0] || 'misc';

  log(`\n   Processing: ${parsedPath.base}`, 'blue');

  // Get original dimensions
  const metadata = await sharp(inputPath).metadata();

  const results = [];

  // Process each resolution
  for (const res of CONFIG.RESOLUTIONS) {
    const width = Math.round(metadata.width * res.scale);
    const height = Math.round(metadata.height * res.scale);

    // Process each format
    for (const format of CONFIG.FORMATS) {
      const outputDir = path.join(CONFIG.PROCESSED_DIR, 'individual', category);
      await fs.mkdir(outputDir, { recursive: true });

      const outputName = `${parsedPath.name}${res.suffix}.${format}`;
      const outputPath = path.join(outputDir, outputName);

      try {
        let pipeline = sharp(inputPath).resize(width, height, {
          kernel: sharp.kernel.lanczos3,
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        });

        if (format === 'png') {
          pipeline = pipeline.png(CONFIG.QUALITY.png);
        } else if (format === 'webp') {
          pipeline = pipeline.webp(CONFIG.QUALITY.webp);
        }

        await pipeline.toFile(outputPath);

        const stats = await fs.stat(outputPath);
        results.push({
          resolution: res.suffix || '1x',
          format: format,
          size: `${Math.round(stats.size / 1024)}KB`,
          path: outputPath
        });

      } catch (error) {
        log(`      ⚠️  Error processing ${format} at ${res.suffix || '1x'}: ${error.message}`, 'red');
      }
    }
  }

  // Log results
  results.forEach(r => {
    log(`      ✓ ${r.resolution} ${r.format.toUpperCase()}: ${r.size}`, 'green');
  });

  return results;
}

/**
 * Generates metadata JSON for processed sprites
 */
async function generateMetadata(processedFiles) {
  log('\n📝 Generating metadata...', 'cyan');

  const metadata = {
    generatedAt: new Date().toISOString(),
    totalSprites: processedFiles.length,
    resolutions: CONFIG.RESOLUTIONS.map(r => r.suffix || '1x'),
    formats: CONFIG.FORMATS,
    sprites: processedFiles.map(file => ({
      original: path.basename(file),
      category: path.basename(path.dirname(file)),
      processed: true
    }))
  };

  const metadataPath = path.join(CONFIG.PROCESSED_DIR, 'metadata.json');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

  log(`   ✓ Metadata saved to: ${metadataPath}`, 'green');
  return metadata;
}

/**
 * Finds folders marked with {tps} for automatic sprite sheet packing
 */
async function findTpsFolder() {
  log('\n🔍 Scanning for {tps} folders...', 'cyan');

  const allDirs = await glob(`${CONFIG.RAW_ASSETS_DIR}/**/*{tps}*/`);

  if (allDirs.length > 0) {
    log(`   Found ${allDirs.length} folders marked for sprite sheet packing:`, 'yellow');
    allDirs.forEach(dir => {
      log(`      • ${path.relative(CONFIG.RAW_ASSETS_DIR, dir)}`, 'yellow');
    });
    log(`\n   💡 Run 'npm run pack-sheets' to pack these into sprite sheets`, 'bright');
  } else {
    log(`   No {tps} folders found`, 'yellow');
  }

  return allDirs;
}

/**
 * Main execution
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🎮 Bridge Battle - Sprite Processing Pipeline', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    // Find all sprites
    const sprites = await findAllSprites();

    if (sprites.length === 0) {
      log('⚠️  No sprites found in raw-assets/ai-generated/', 'yellow');
      log('\n💡 Tip: Place your AI-generated sprites in:', 'cyan');
      log('   raw-assets/ai-generated/characters/', 'cyan');
      log('   raw-assets/ai-generated/enemies/', 'cyan');
      log('   raw-assets/ai-generated/obstacles/', 'cyan');
      log('   etc.\n', 'cyan');
      return;
    }

    // Process each sprite
    log('\n⚙️  Processing sprites...', 'cyan');
    const processedFiles = [];

    for (const sprite of sprites) {
      await processSprite(sprite);
      processedFiles.push(sprite);
    }

    // Generate metadata
    await generateMetadata(processedFiles);

    // Check for TPS folders
    await findTpsFolder();

    // Summary
    log('\n' + '='.repeat(60), 'green');
    log('✅ Processing Complete!', 'bright');
    log('='.repeat(60), 'green');
    log(`\n   Processed: ${processedFiles.length} sprites`, 'green');
    log(`   Output: ${CONFIG.PROCESSED_DIR}/individual/`, 'green');
    log(`   Resolutions: ${CONFIG.RESOLUTIONS.map(r => r.suffix || '1x').join(', ')}`, 'green');
    log(`   Formats: ${CONFIG.FORMATS.join(', ').toUpperCase()}`, 'green');

    log('\n📦 Next Steps:', 'cyan');
    log('   1. Review processed sprites in processed-assets/individual/', 'cyan');
    log('   2. Run "npm run pack-sheets" to create sprite sheets', 'cyan');
    log('   3. Run "npm run optimize" for additional optimization', 'cyan');
    log('   4. Import sprites into your Unity/Godot project\n', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { processSprite, findAllSprites, generateMetadata };
