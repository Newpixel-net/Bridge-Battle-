#!/usr/bin/env node

/**
 * Bridge Battle - Sprite Sheet Packer
 *
 * Packs animation frames from {tps} folders into sprite sheets:
 * - Automatically detects {tps} tagged folders
 * - Arranges frames in optimal grid layout
 * - Generates sprite sheet metadata (frame positions, dimensions)
 * - Creates atlas JSON for game engines
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { glob } = require('glob');

const CONFIG = {
  RAW_ASSETS_DIR: path.join(__dirname, '../raw-assets/ai-generated'),
  OUTPUT_DIR: path.join(__dirname, '../processed-assets/sprite-sheets'),
  MAX_SHEET_SIZE: 4096,
  PADDING: 2,
  POWER_OF_TWO: true
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
 * Finds next power of two (for optimal GPU texture sizes)
 */
function nextPowerOfTwo(n) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Calculates optimal grid layout for sprites
 */
function calculateLayout(frameCount, frameWidth, frameHeight) {
  const cols = Math.ceil(Math.sqrt(frameCount));
  const rows = Math.ceil(frameCount / cols);

  let width = cols * (frameWidth + CONFIG.PADDING) - CONFIG.PADDING;
  let height = rows * (frameHeight + CONFIG.PADDING) - CONFIG.PADDING;

  if (CONFIG.POWER_OF_TWO) {
    width = nextPowerOfTwo(width);
    height = nextPowerOfTwo(height);
  }

  return { cols, rows, width, height };
}

/**
 * Packs frames into a sprite sheet
 */
async function packSpriteSheet(folderPath) {
  const folderName = path.basename(folderPath).replace(/\{tps\}/g, '').trim();
  log(`\n📦 Packing: ${folderName}`, 'cyan');

  // Find all image files in folder
  const patterns = [
    path.join(folderPath, '*.png'),
    path.join(folderPath, '*.jpg'),
    path.join(folderPath, '*.jpeg'),
    path.join(folderPath, '*.webp')
  ];

  let frames = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern);
    frames.push(...matches);
  }

  // Sort frames by filename (assuming numbered frames)
  frames.sort((a, b) => {
    const aNum = parseInt(path.basename(a).match(/\d+/) || '0');
    const bNum = parseInt(path.basename(b).match(/\d+/) || '0');
    return aNum - bNum;
  });

  if (frames.length === 0) {
    log(`   ⚠️  No frames found in folder`, 'yellow');
    return null;
  }

  log(`   Found ${frames.length} frames`, 'blue');

  // Get dimensions of first frame (assuming all frames are same size)
  const firstFrame = await sharp(frames[0]).metadata();
  const frameWidth = firstFrame.width;
  const frameHeight = firstFrame.height;

  // Calculate layout
  const layout = calculateLayout(frames.length, frameWidth, frameHeight);
  log(`   Grid: ${layout.cols}x${layout.rows}`, 'blue');
  log(`   Sheet size: ${layout.width}x${layout.height}px`, 'blue');

  // Create transparent canvas
  const canvas = await sharp({
    create: {
      width: layout.width,
      height: layout.height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).png();

  // Composite all frames onto canvas
  const composites = [];
  const frameMetadata = [];

  for (let i = 0; i < frames.length; i++) {
    const col = i % layout.cols;
    const row = Math.floor(i / layout.cols);
    const x = col * (frameWidth + CONFIG.PADDING);
    const y = row * (frameHeight + CONFIG.PADDING);

    composites.push({
      input: frames[i],
      left: x,
      top: y
    });

    frameMetadata.push({
      frame: i,
      filename: path.basename(frames[i]),
      x: x,
      y: y,
      width: frameWidth,
      height: frameHeight
    });
  }

  // Generate sprite sheet
  await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });

  const outputPath = path.join(CONFIG.OUTPUT_DIR, `${folderName}.png`);
  await canvas.composite(composites).toFile(outputPath);

  log(`   ✓ Sprite sheet created: ${outputPath}`, 'green');

  // Generate atlas metadata
  const atlas = {
    name: folderName,
    imageFile: `${folderName}.png`,
    frameWidth: frameWidth,
    frameHeight: frameHeight,
    frameCount: frames.length,
    columns: layout.cols,
    rows: layout.rows,
    sheetWidth: layout.width,
    sheetHeight: layout.height,
    padding: CONFIG.PADDING,
    frames: frameMetadata
  };

  const atlasPath = path.join(CONFIG.OUTPUT_DIR, `${folderName}.json`);
  await fs.writeFile(atlasPath, JSON.stringify(atlas, null, 2));

  log(`   ✓ Atlas metadata created: ${atlasPath}`, 'green');

  return { spriteSheet: outputPath, atlas: atlasPath, metadata: atlas };
}

/**
 * Main execution
 */
async function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📦 Bridge Battle - Sprite Sheet Packer', 'bright');
  log('='.repeat(60) + '\n', 'cyan');

  try {
    // Find all {tps} folders
    const tpsFolders = await glob(`${CONFIG.RAW_ASSETS_DIR}/**/*{tps}*/`);

    if (tpsFolders.length === 0) {
      log('⚠️  No {tps} folders found', 'yellow');
      log('\n💡 To auto-pack animation frames:', 'cyan');
      log('   1. Create a folder with {tps} in the name:', 'cyan');
      log('      Example: raw-assets/ai-generated/hero-walk{tps}/', 'cyan');
      log('   2. Place your animation frames inside:', 'cyan');
      log('      frame-01.png, frame-02.png, etc.', 'cyan');
      log('   3. Run this script again\n', 'cyan');
      return;
    }

    log(`Found ${tpsFolders.length} folders to pack:\n`);

    const results = [];
    for (const folder of tpsFolders) {
      const result = await packSpriteSheet(folder);
      if (result) {
        results.push(result);
      }
    }

    // Summary
    log('\n' + '='.repeat(60), 'green');
    log('✅ Packing Complete!', 'bright');
    log('='.repeat(60), 'green');
    log(`\n   Packed ${results.length} sprite sheets`, 'green');
    log(`   Output: ${CONFIG.OUTPUT_DIR}/`, 'green');

    log('\n📋 Generated Files:', 'cyan');
    results.forEach(r => {
      log(`   • ${path.basename(r.spriteSheet)} (${r.metadata.frameCount} frames)`, 'cyan');
      log(`     Atlas: ${path.basename(r.atlas)}`, 'cyan');
    });

    log('\n🎮 Usage in Game Engine:', 'yellow');
    log('   Unity: Import PNG and use JSON to slice sprite sheet', 'yellow');
    log('   Godot: Use AtlasTexture with frame positions from JSON', 'yellow');
    log('   Phaser: Load sprite sheet with atlas JSON\n', 'yellow');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { packSpriteSheet };
