# Changelog

All notable changes to the Sprite System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-06

### Added
- Initial release of the standalone sprite system
- `BillboardSprite` - Camera-facing 3D sprites with animation
- `SpriteAnimationController` - UV-based sprite sheet animation
- `SpriteTextureManager` - Texture loading and caching system
- `CanvasSpriteRenderer` - Dynamic canvas-based sprite rendering
- `SpriteConfig` - Configuration utilities and presets
- Complete API documentation
- Usage examples:
  - Basic character example
  - Canvas UI example
  - State-based animation example
- MIT License

### Features
- Game-agnostic design - works with any rendering engine
- Efficient UV-based animation (no geometry updates)
- Texture cloning for independent UV manipulation
- Shadow support for billboard sprites
- Multiple animation support with callbacks
- Canvas-based text, progress bars, and shapes
- Configuration validation
- Comprehensive JSDoc annotations

### Extracted From
- Bridge Battle game (https://github.com/Newpixel-net/Bridge-Battle-)
- All game-specific code removed
- Complete separation from game logic
- Ready for use in any project

---

## Release Notes

This sprite system was extracted from the Bridge Battle game to create a reusable,
game-agnostic sprite rendering and animation system. All game-specific dependencies
have been removed, making it suitable for use in any 2D/3D game project.

### What's Included
- Core sprite rendering classes
- Animation system with state management
- Texture loading and management
- Canvas-based dynamic sprite generation
- Configuration utilities and presets
- Complete documentation and examples

### What's Not Included
- Game-specific logic (formations, AI, physics, etc.)
- Phaser.js dependencies (uses pure THREE.js concepts)
- Game constants and configurations
- Asset files (you provide your own sprite sheets)

### Requirements
- A rendering engine with sprite/billboard support (tested with THREE.js)
- ES6 module support
- Canvas API support
- WebGL (for 3D rendering)

### Getting Started
See README.md for installation and usage instructions.
See docs/API.md for complete API reference.
See examples/ directory for usage examples.
