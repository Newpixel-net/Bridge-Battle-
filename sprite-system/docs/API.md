# Sprite System API Reference

Complete API documentation for the sprite system.

## Table of Contents

- [BillboardSprite](#billboardsprite)
- [SpriteAnimationController](#spriteanimationcontroller)
- [SpriteTextureManager](#spritetexturemanager)
- [CanvasSpriteRenderer](#canvasspriterenderer)
- [SpriteConfig](#spriteconfig)

---

## BillboardSprite

Camera-facing 3D sprite with animation support.

### Constructor

```javascript
new BillboardSprite(options)
```

**Parameters:**
- `options.texture` (Object, required) - Texture object for the sprite
- `options.position` (Object, optional) - Initial position `{x, y, z}`, default: `{x:0, y:0, z:0}`
- `options.size` (Object, optional) - Sprite size `{width, height}`
- `options.spriteSheet` (Object, required) - Sprite sheet configuration
  - `frameWidth` (number) - Frame width in pixels
  - `frameHeight` (number) - Frame height in pixels
  - `columns` (number) - Grid columns
  - `rows` (number) - Grid rows
  - `totalFrames` (number) - Total frames
  - `frameRate` (number, optional) - Animation frame rate, default: 30
- `options.animations` (Object, optional) - Animation definitions
- `options.materialOptions` (Object, optional) - Material options
- `options.shadow` (Object, optional) - Shadow configuration
  - `enabled` (boolean) - Enable shadow, default: false
  - `radius` (number) - Shadow radius, default: 0.5
  - `opacity` (number) - Shadow opacity, default: 0.3
- `options.renderEngine` (Object, required) - Rendering engine (e.g., THREE)

### Methods

#### update(deltaTime)
Update the sprite animation.
- `deltaTime` (number) - Time elapsed since last update in seconds

#### play(animationName, loop)
Play an animation by name.
- `animationName` (string) - Animation name
- `loop` (boolean, optional) - Whether to loop, default: true
- Returns: (boolean) True if animation started successfully

#### stop()
Stop the current animation.

#### pause()
Pause the current animation.

#### resume()
Resume the current animation.

#### setPosition(x, y, z)
Set sprite position.
- `x` (number) - X coordinate
- `y` (number) - Y coordinate
- `z` (number) - Z coordinate

#### getPosition()
Get sprite position.
- Returns: (Object) Position `{x, y, z}`

#### setScale(scaleX, scaleY)
Set sprite scale.
- `scaleX` (number) - X scale
- `scaleY` (number, optional) - Y scale, defaults to scaleX

#### setOpacity(opacity)
Set sprite opacity.
- `opacity` (number) - Opacity value 0-1

#### setColor(color)
Set sprite color tint.
- `color` (number) - Color value (e.g., 0xFF0000 for red)

#### setVisible(visible)
Set sprite visibility.
- `visible` (boolean) - Visibility state

#### getObject3D()
Get the 3D group object for adding to scene.
- Returns: (Object) The THREE.Group or equivalent

#### getAnimationState()
Get current animation state.
- Returns: (Object) `{currentAnimation, currentFrame, isPlaying, loop, progress}`

#### hasAnimation(name)
Check if animation exists.
- `name` (string) - Animation name
- Returns: (boolean) True if animation exists

#### addAnimation(name, startFrame, endFrame, options)
Add a new animation.
- `name` (string) - Animation name
- `startFrame` (number) - Start frame index
- `endFrame` (number) - End frame index
- `options` (Object, optional) - Animation options

#### onAnimationComplete(callback)
Set callback for animation completion.
- `callback` (Function) - Callback function `(animationName) => {}`

#### onFrameChange(callback)
Set callback for frame changes.
- `callback` (Function) - Callback function `(frameIndex, animationName) => {}`

#### cleanup()
Clean up resources and dispose of materials/geometry.

---

## SpriteAnimationController

UV-based sprite sheet animation controller.

### Constructor

```javascript
new SpriteAnimationController(spriteSheetTexture, options)
```

**Parameters:**
- `spriteSheetTexture` (Object, required) - Texture object
- `options` (Object, required) - Configuration options
  - `frameWidth` (number) - Frame width in pixels
  - `frameHeight` (number) - Frame height in pixels
  - `columns` (number) - Grid columns
  - `rows` (number) - Grid rows
  - `totalFrames` (number) - Total frames
  - `frameRate` (number, optional) - Frame rate, default: 30

### Methods

#### addAnimation(name, startFrame, endFrame, options)
Define an animation by name and frame range.
- `name` (string) - Unique animation name
- `startFrame` (number) - Starting frame index (0-based)
- `endFrame` (number) - Ending frame index (inclusive)
- `options` (Object, optional) - Animation options
  - `frameRate` (number) - Override frame rate
- Returns: (SpriteAnimationController) Returns this for chaining

#### play(animationName, loop)
Play an animation by name.
- `animationName` (string) - Animation name
- `loop` (boolean, optional) - Whether to loop, default: true
- Returns: (boolean) True if animation started successfully

#### stop()
Stop the current animation.

#### pause()
Pause the current animation.

#### resume()
Resume the current animation.

#### reset()
Reset animation to the first frame.

#### setFrame(frameIndex)
Set a specific frame.
- `frameIndex` (number) - Frame index to set

#### update(deltaTime)
Update animation (call in game loop).
- `deltaTime` (number) - Time elapsed since last update in seconds

#### getState()
Get current animation state.
- Returns: (Object) `{currentAnimation, currentFrame, isPlaying, loop, progress}`

#### getAnimationNames()
Get list of all registered animations.
- Returns: (string[]) Array of animation names

#### hasAnimation(name)
Check if animation exists.
- `name` (string) - Animation name
- Returns: (boolean) True if animation exists

---

## SpriteTextureManager

Texture loading and management system.

### Constructor

```javascript
new SpriteTextureManager(options)
```

**Parameters:**
- `options.loader` (Object, required) - Texture loader (e.g., THREE.TextureLoader)
- `options.textureConfig` (Object, optional) - Default texture configuration
  - `magFilter` (number) - Magnification filter
  - `minFilter` (number) - Minification filter
  - `generateMipmaps` (boolean) - Generate mipmaps, default: true
  - `wrapS` (number) - S wrapping mode
  - `wrapT` (number) - T wrapping mode

### Methods

#### loadTexture(name, path, config)
Load a sprite sheet texture.
- `name` (string) - Unique identifier
- `path` (string) - Path to texture file
- `config` (Object, optional) - Texture configuration (overrides defaults)
- Returns: (Promise<Object>) Promise resolving to loaded texture

#### loadTextures(textures)
Load multiple textures in parallel.
- `textures` (Array<Object>) - Array of `{name, path, config}` objects
- Returns: (Promise<Object[]>) Promise resolving to array of loaded textures

#### getTexture(name, clone)
Get a loaded texture.
- `name` (string) - Texture name
- `clone` (boolean, optional) - Whether to clone, default: true
- Returns: (Object|null) Texture object or null if not found

#### getOriginalTexture(name)
Get the original (non-cloned) texture.
- `name` (string) - Texture name
- Returns: (Object|null) Original texture or null

#### hasTexture(name)
Check if texture is loaded.
- `name` (string) - Texture name
- Returns: (boolean) True if loaded

#### isLoading(name)
Check if texture is currently loading.
- `name` (string) - Texture name
- Returns: (boolean) True if loading

#### unloadTexture(name)
Unload a texture from memory.
- `name` (string) - Texture name
- Returns: (boolean) True if unloaded

#### unloadAll()
Unload all textures from memory.

#### getLoadedTextures()
Get list of all loaded texture names.
- Returns: (string[]) Array of texture names

#### getStats()
Get loading statistics.
- Returns: (Object) `{loaded, failed, cached, totalLoaded, currentlyLoading}`

#### waitForAll()
Wait for all pending loads to complete.
- Returns: (Promise<Object[]>) Promise resolving when all loads complete

---

## CanvasSpriteRenderer

Dynamic canvas-based sprite renderer.

### Constructor

```javascript
new CanvasSpriteRenderer(options)
```

**Parameters:**
- `options.renderEngine` (Object, required) - Rendering engine (e.g., THREE)
- `options.textureClass` (Object, optional) - Custom texture class
- `options.spriteClass` (Object, optional) - Custom sprite class
- `options.spriteMaterialClass` (Object, optional) - Custom material class

### Methods

#### createCustomSprite(drawFunction, options)
Create sprite from custom canvas drawing.
- `drawFunction` (Function) - Drawing function `(ctx, canvas) => {}`
- `options` (Object, optional)
  - `width` (number) - Canvas width, default: 256
  - `height` (number) - Canvas height, default: 256
  - `scale` (number) - Sprite scale, default: 1
  - `materialOptions` (Object) - Material options
- Returns: (Object) `{sprite, canvas, texture, update, dispose}`

#### createTextSprite(text, options)
Create a text sprite.
- `text` (string) - Text to render
- `options` (Object, optional)
  - `font` (string) - Font family, default: 'Arial'
  - `fontSize` (number) - Font size, default: 32
  - `fontWeight` (string) - Font weight, default: 'normal'
  - `color` (string) - Text color, default: '#FFFFFF'
  - `backgroundColor` (string) - Background color, default: 'transparent'
  - `padding` (number) - Padding around text, default: 10
  - `align` (string) - Text alignment, default: 'center'
  - `baseline` (string) - Text baseline, default: 'middle'
  - `scale` (number) - Sprite scale, default: 1
  - `stroke` (Object) - Stroke options
    - `color` (string) - Stroke color
    - `width` (number) - Stroke width
  - `shadow` (Object) - Shadow options
- Returns: (Object) Sprite object

#### createProgressBarSprite(value, options)
Create a progress bar sprite.
- `value` (number) - Current value 0-1
- `options` (Object, optional)
  - `width` (number) - Bar width, default: 200
  - `height` (number) - Bar height, default: 20
  - `fillColor` (string) - Fill color, default: '#00FF00'
  - `backgroundColor` (string) - Background color, default: '#333333'
  - `borderColor` (string) - Border color, default: '#FFFFFF'
  - `borderWidth` (number) - Border width, default: 2
  - `scale` (number) - Sprite scale, default: 1
- Returns: (Object) Sprite object with `updateValue(newValue)` method

#### createCircleSprite(options)
Create a circular sprite.
- `options` (Object, optional)
  - `radius` (number) - Circle radius, default: 32
  - `fillColor` (string) - Fill color, default: '#FF0000'
  - `strokeColor` (string) - Stroke color
  - `strokeWidth` (number) - Stroke width, default: 0
  - `scale` (number) - Sprite scale, default: 1
- Returns: (Object) Sprite object

#### createRectangleSprite(options)
Create a rectangle sprite.
- `options` (Object, optional)
  - `width` (number) - Rectangle width, default: 64
  - `height` (number) - Rectangle height, default: 64
  - `fillColor` (string) - Fill color, default: '#0000FF'
  - `strokeColor` (string) - Stroke color
  - `strokeWidth` (number) - Stroke width, default: 0
  - `cornerRadius` (number) - Corner radius, default: 0
  - `scale` (number) - Sprite scale, default: 1
- Returns: (Object) Sprite object

---

## SpriteConfig

Configuration utilities and helpers.

### Constants

#### DEFAULT_SPRITE_SHEET_CONFIG
Default sprite sheet configuration.

#### DEFAULT_TEXTURE_CONFIG
Default texture configurations (pixelPerfect, smooth).

#### DEFAULT_MATERIAL_OPTIONS
Default material options.

#### DEFAULT_SHADOW_CONFIG
Default shadow configuration.

#### ANIMATION_FRAME_RATES
Common frame rates (CINEMATIC: 24, STANDARD: 30, SMOOTH: 60, FAST: 120).

### Functions

#### createSpriteSheetConfig(options)
Create sprite sheet config from texture size.
- `options.textureWidth` (number) - Total texture width
- `options.textureHeight` (number) - Total texture height
- `options.frameWidth` (number) - Single frame width
- `options.frameHeight` (number) - Single frame height
- `options.frameRate` (number, optional) - Frame rate, default: 30
- Returns: (Object) Sprite sheet configuration

#### createAnimations(animationList)
Create animation definitions from metadata.
- `animationList` (Array<Object>) - List of animation definitions
- Returns: (Object) Animation definitions map

#### calculateSpriteSize(options)
Calculate sprite size from dimensions.
- `options.width` (number, optional) - Target width
- `options.height` (number, optional) - Target height
- `options.frameWidth` (number) - Frame width in pixels
- `options.frameHeight` (number) - Frame height in pixels
- Returns: (Object) Size `{width, height}`

#### getPreset(preset)
Get a configuration preset.
- `preset` (string) - Preset name: 'character', 'ui', 'particle', 'large', 'pixelArt'
- Returns: (Object) Configuration object

#### mergeConfigs(...configs)
Merge multiple configurations.
- `configs` (Object[]) - Configuration objects to merge
- Returns: (Object) Merged configuration

#### validateSpriteSheetConfig(config)
Validate sprite sheet configuration.
- `config` (Object) - Configuration to validate
- Returns: (Object) `{valid, errors}`

#### validateAnimation(animation, totalFrames)
Validate animation definition.
- `animation` (Object) - Animation to validate
- `totalFrames` (number) - Total frames in sprite sheet
- Returns: (Object) `{valid, errors}`

---

## Quick Reference

### Common Patterns

```javascript
// Setup
import * as THREE from 'three';
import { BillboardSprite, SpriteTextureManager } from './sprite-system/src/index.js';

// Load textures
const manager = new SpriteTextureManager({ loader: new THREE.TextureLoader() });
await manager.loadTexture('hero', '/sprites/hero.png');

// Create sprite
const sprite = new BillboardSprite({
    texture: manager.getTexture('hero'),
    position: { x: 0, y: 0, z: 0 },
    size: { height: 1.5 },
    spriteSheet: { frameWidth: 64, frameHeight: 64, columns: 8, rows: 4, totalFrames: 24 },
    animations: { idle: { startFrame: 0, endFrame: 5 } },
    renderEngine: THREE
});

// Add to scene
scene.add(sprite.getObject3D());
sprite.play('idle');

// Update loop
function animate() {
    sprite.update(clock.getDelta());
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
```
