#!/usr/bin/env node

/**
 * Bridge Battle - Sprite Sheet Slicer
 *
 * Slices a sprite sheet into individual frames AND keeps the full sheet with atlas
 * Supports command line arguments: node slice-sprite-sheet.js <input-path> <base-name>
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Analyzes sprite sheet and detects grid layout
 */
async function analyzeSpriteSheet(imagePath) {
  const metadata = await sharp(imagePath).metadata();

  log('\n📊 Analyzing sprite sheet...', 'cyan');
  log(`   Dimensions: ${metadata.width}x${metadata.height}px`, 'blue');
  log(`   Format: ${metadata.format.toUpperCase()}`, 'blue');
  log(`   Has transparency: ${metadata.hasAlpha ? 'Yes' : 'No'}`, 'blue');

  return metadata;
}

/**
 * Extracts individual frames from sprite sheet
 */
async function extractFrames(imagePath, cols, rows, outputDir) {
  const metadata = await sharp(imagePath).metadata();
  const frameWidth = Math.floor(metadata.width / cols);
  const frameHeight = Math.floor(metadata.height / rows);

  log('\n✂️  Extracting individual frames...', 'cyan');
  log(`   Grid: ${cols}x${rows} = ${cols * rows} frames`, 'blue');
  log(`   Frame size: ${frameWidth}x${frameHeight}px`, 'blue');

  const frames = [];
  let frameNumber = 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const left = col * frameWidth;
      const top = row * frameHeight;

      const frameName = `frame-${String(frameNumber).padStart(2, '0')}.png`;
      const framePath = path.join(outputDir, frameName);

      await sharp(imagePath)
        .extract({
          left: left,
          top: top,
          width: frameWidth,
          height: frameHeight
        })
        .png({ compressionLevel: 9 })
        .toFile(framePath);

      frames.push({
        frame: frameNumber - 1,
        filename: frameName,
        x: left,
        y: top,
        width: frameWidth,
        height: frameHeight
      });

      if (frameNumber % 6 === 0) {
        log(`   ✓ Extracted frames ${frameNumber - 5} to ${frameNumber}`, 'green');
      }

      frameNumber++;
    }
  }

  log(`   ✓ All ${frames.length} frames extracted!`, 'green');
  return { frames, frameWidth, frameHeight };
}

/**
 * Creates multi-resolution versions (only 4x for individual frames)
 */
async function createMultiResolution(sourceDir, frames) {
  log('\n🔍 Creating high-resolution versions (4x)...', 'cyan');

  const resolutions = [
    { suffix: '@4x', scale: 4 }
  ];

  let processed = 0;

  for (const frame of frames) {
    const sourcePath = path.join(sourceDir, frame.filename);

    for (const res of resolutions) {
      const parsed = path.parse(frame.filename);
      const outputName = `${parsed.name}${res.suffix}${parsed.ext}`;
      const outputPath = path.join(sourceDir, outputName);

      await sharp(sourcePath)
        .resize(
          Math.round(frame.width * res.scale),
          Math.round(frame.height * res.scale),
          {
            kernel: sharp.kernel.lanczos3,
            fit: 'fill'
          }
        )
        .png({ compressionLevel: 9 })
        .toFile(outputPath);

      processed++;
    }

    if (processed % 6 === 0) {
      log(`   ✓ Processed ${processed} frames...`, 'green');
    }
  }

  log(`   ✓ Created ${processed} high-resolution files`, 'green');
}

/**
 * Creates optimized sprite sheet versions (only 2x)
 */
async function createSpriteSheetVersions(sourcePath, outputDir, baseName) {
  log('\n📦 Creating optimized sprite sheet (2x resolution)...', 'cyan');

  const resolutions = [
    { suffix: '@2x', scale: 2, name: '2x' }
  ];

  const metadata = await sharp(sourcePath).metadata();

  for (const res of resolutions) {
    const outputName = `${baseName}${res.suffix}.png`;
    const outputPath = path.join(outputDir, outputName);

    await sharp(sourcePath)
      .resize(
        Math.round(metadata.width * res.scale),
        Math.round(metadata.height * res.scale),
        {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill'
        }
      )
      .png({ compressionLevel: 9, quality: 95 })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    log(`   ✓ ${res.name}: ${outputName} (${Math.round(stats.size / 1024)}KB)`, 'green');
  }
}

/**
 * Generates atlas JSON
 */
async function generateAtlas(frames, frameWidth, frameHeight, cols, rows, totalFrames, outputPath, baseName) {
  log('\n📋 Generating sprite sheet atlas...', 'cyan');

  const atlas = {
    name: baseName,
    imageFile: `${baseName}.png`,
    description: "Bridge Battle squad member sprite sheet",
    frameWidth: frameWidth,
    frameHeight: frameHeight,
    columns: cols,
    rows: rows,
    totalFrames: totalFrames,
    padding: 0,
    frames: frames,
    animations: {
      idle: [0, 5],
      run: [6, 11],
      shoot: [12, 17],
      death: [18, 23],
      custom1: [24, 29],
      custom2: [30, 35]
    },
    notes: "Animation mappings are estimates. Adjust based on actual sprite content."
  };

  await fs.writeFile(outputPath, JSON.stringify(atlas, null, 2));
  log(`   ✓ Atlas saved: ${path.basename(outputPath)}`, 'green');

  return atlas;
}

/**
 * Main execution
 */
async function main() {
  log('\n' + '='.repeat(70), 'cyan');
  log('✂️  Bridge Battle - Sprite Sheet Processor (Option 3: BOTH)', 'bright');
  log('='.repeat(70) + '\n', 'cyan');

  try {
    // Get arguments from command line
    const args = process.argv.slice(2);
    if (args.length < 2) {
      log('❌ Usage: node slice-sprite-sheet.js <input-path> <base-name>', 'red');
      log('   Example: node slice-sprite-sheet.js raw-assets/ai-generated/main_character/run.png run', 'yellow');
      process.exit(1);
    }

    const inputPath = args[0];
    const baseName = args[1];
    const cols = 6;
    const rows = 6;

    // Validate input file exists
    try {
      await fs.access(inputPath);
    } catch {
      log(`❌ Error: Input file not found: ${inputPath}`, 'red');
      process.exit(1);
    }

    // Create output directories
    const individualDir = path.join(__dirname, `../processed-assets/individual/characters/${baseName}`);
    const sheetDir = path.join(__dirname, `../processed-assets/sprite-sheets/${baseName}`);

    await fs.mkdir(individualDir, { recursive: true });
    await fs.mkdir(sheetDir, { recursive: true });

    // Analyze sprite sheet
    const metadata = await analyzeSpriteSheet(inputPath);

    // Extract individual frames
    const { frames, frameWidth, frameHeight } = await extractFrames(
      inputPath,
      cols,
      rows,
      individualDir
    );

    // Create multi-resolution frames
    await createMultiResolution(individualDir, frames);

    // Create optimized sprite sheet versions
    await createSpriteSheetVersions(inputPath, sheetDir, baseName);

    // Generate atlas JSON
    const atlas = await generateAtlas(
      frames,
      frameWidth,
      frameHeight,
      cols,
      rows,
      cols * rows,
      path.join(sheetDir, `${baseName}.json`),
      baseName
    );

    // Summary
    log('\n' + '='.repeat(70), 'green');
    log('✅ Processing Complete!', 'bright');
    log('='.repeat(70) + '\n', 'green');

    log('📁 INDIVIDUAL FRAMES:', 'cyan');
    log(`   Location: processed-assets/individual/characters/${baseName}/`, 'cyan');
    log(`   Files: ${frames.length} base + ${frames.length} @4x = ${frames.length * 2} files`, 'green');
    log(`   Sizes: Base (${frameWidth}×${frameHeight}), 4x (${frameWidth * 4}×${frameHeight * 4})`, 'blue');

    log('\n📦 SPRITE SHEET:', 'cyan');
    log(`   Location: processed-assets/sprite-sheets/${baseName}/`, 'cyan');
    log(`   Files: 1 sprite sheet @2x + 1 atlas JSON`, 'green');
    log(`   Sheet: ${baseName}@2x.png (5016×5280px)`, 'blue');
    log(`   Atlas: ${baseName}.json (with frame coordinates)`, 'blue');

    log('\n🎮 USAGE:', 'yellow');
    log('   Individual frames: Perfect for frame-by-frame animation', 'yellow');
    log('   Sprite sheet: More efficient, use atlas JSON for frame positions', 'yellow');

    log('\n🎯 NEXT STEPS:', 'magenta');
    log('   1. Review processed sprites in processed-assets/', 'magenta');
    log('   2. Import into Unity/Godot/Phaser', 'magenta');
    log('   3. Use atlas JSON to set up animations', 'magenta');
    log('   4. Test in your game!\n', 'magenta');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run main if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { extractFrames, createMultiResolution, generateAtlas };
