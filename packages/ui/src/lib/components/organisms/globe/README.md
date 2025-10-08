# Globe Component

A 3D interactive globe visualization component using [globe.gl](https://github.com/vasturiano/globe.gl) and Three.js. Displays locations with custom markers, animated arcs between locations, expanding rings, and collision-aware labels.

**Built with Svelte 5 `{@attach}` directive for proper SSR compatibility.**

## Features

✨ **Core Features**
- 🌍 3D WebGL globe with customizable earth textures
- 📍 Custom SVG markers for locations with active/inactive states
- 🏷️ Smart labels with automatic collision detection
- ⚡ Smooth arc animations between locations
- 💫 Expanding ring animations with fade effects
- 🎥 Animated camera transitions
- ⏯️ Auto-play system with configurable intervals
- 🖱️ Pause on user interaction with auto-resume
- ⌨️ Keyboard navigation (Arrow keys)
- 📱 Fully responsive with media query support

## Installation

The dependencies are already installed in the `@layerd/ui` package:

```bash
pnpm --filter @layerd/ui add globe.gl three
```

## Basic Usage

```svelte
<script>
	import { Globe } from '@layerd/ui';

	const locations = [
		{
			location: 'New York',
			lat: 40.7128,
			lng: -74.0060,
			phone: '+1 (212) 555-0100',
			email: 'ny@example.com'
		}
	];

	const ports = [
		{
			port: 'Brooklyn Port',
			city: 'Brooklyn',
			location: 'New York',
			lat: 40.6526,
			lng: -74.0102
		}
	];
</script>

<div class="w-full h-screen">
	<Globe {locations} {ports} />
</div>
```

## Using Example Data

```svelte
<script>
	import { Globe } from '@layerd/ui';
	import { exampleLocations, examplePorts } from '@layerd/ui';
</script>

<div class="w-full h-screen">
	<Globe locations={exampleLocations} ports={examplePorts} />
</div>
```

## Props

### Main Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `locations` | `Location[]` | `[]` | Array of location objects to display on the globe |
| `ports` | `Port[]` | `[]` | Array of port objects associated with locations |
| `config` | `Partial<GlobeConfig>` | `{}` | Configuration object to customize globe behavior |
| `class` | `string` | `''` | Additional CSS classes for the container |

### Location Type

```typescript
interface Location {
	location: string;    // Location name
	lat: number | string; // Latitude
	lng: number | string; // Longitude
	phone?: string;       // Optional contact phone
	email?: string;       // Optional contact email
}
```

### Port Type

```typescript
interface Port {
	port: string;        // Port name
	city: string;        // City name
	location: string;    // Associated location name (must match Location.location)
	lat: number | string; // Latitude
	lng: number | string; // Longitude
}
```

## Configuration

The `config` prop accepts a `GlobeConfig` object with the following options:

### Globe Appearance

```typescript
{
	imgEarth?: string;           // Earth texture image URL
	globeWidth?: number;          // Globe width in pixels
	globeHeight?: number;         // Globe height in pixels
	globeLeft?: number;           // Globe left offset
	globeTop?: number;            // Globe top offset
}
```

### Camera & Position

```typescript
{
	povAltitude?: number;         // Camera altitude (0-2+)
	povLatitude?: number;         // Camera latitude offset
}
```

### Labels

```typescript
{
	labelSize?: number;           // Label text size
	labelDotRadius?: number;      // Label dot radius
	labelTextColor?: string;      // Label text color (rgba)
	labelDotColor?: string;       // Label dot color
}
```

### Rings

```typescript
{
	ringMaxRadius?: number;       // Maximum ring radius
	ringPropagationSpeed?: number; // Ring expansion speed (deg/sec)
	ringAltitude?: number;        // Ring altitude above globe
}
```

### Arcs

```typescript
{
	arcRelativeLength?: number;   // Arc length relative to full path (0-1)
	arcFlightTime?: number;       // Arc animation duration (ms)
	arcStroke?: number;           // Arc line thickness
	arcColor?: string;            // Arc color (rgba)
	arcAltitudeAutoscale?: number; // Arc height auto-scaling factor
}
```

### Animation

```typescript
{
	animationDuration?: number;   // Camera transition duration (ms)
}
```

### Auto-play

```typescript
{
	autoPlay?: boolean;                      // Enable auto-play
	autoPlayInterval?: number;               // Time between location changes (ms)
	autoPlayPauseOnInteraction?: boolean;    // Pause when user interacts
	autoPlayResumeDelay?: number;            // Delay before resuming (ms)
}
```

## Advanced Usage

### Custom Configuration

```svelte
<script>
	import { Globe } from '@layerd/ui';

	const customConfig = {
		autoPlay: true,
		autoPlayInterval: 5000,
		arcFlightTime: 3000,
		ringMaxRadius: 6,
		labelSize: 1.0,
		povAltitude: 0.5
	};
</script>

<Globe 
	{locations} 
	{ports} 
	config={customConfig}
	class="custom-globe"
/>
```

### Responsive Design

The component automatically adjusts based on window size using built-in media queries:

```typescript
// Values change at breakpoints: 640px (sm), 768px (md), 1024px (lg)
mq(defaultValue, smValue, mdValue, lgValue)
```

### Keyboard Navigation

- **Arrow Left**: Previous location
- **Arrow Right**: Next location

Navigation automatically pauses auto-play (if enabled) and resumes after the configured delay.

## Styling

### Global Styles

The component includes global styles for markers:

```css
:global(.svg-marker) {
	/* Default marker styles */
}

:global(.svg-marker.active) {
	/* Active marker styles */
}

:global(.svg-marker:hover) {
	/* Hover marker styles */
}
```

### Custom Marker Styling

Override the default marker styles in your component:

```svelte
<style>
	:global(.svg-marker) {
		width: 50px !important;
		height: 50px !important;
	}

	:global(.svg-marker.active .stroke) {
		stroke: red !important;
	}
</style>
```

## Assets Required

Place earth texture images in your `/static` or `/public` folder:

- `/images/skins/earth-blue-marble.jpg` (default)
- Or provide a custom path via `config.imgEarth`

Alternative textures available:
- `earth-dark.jpg`
- `earth-night.jpg`
- `earth-topology.png`
- `earth-water.png`

## Examples

### Simple Globe

```svelte
<Globe locations={myLocations} ports={myPorts} />
```

### With Custom Auto-play

```svelte
<Globe 
	{locations} 
	{ports} 
	config={{ 
		autoPlay: true, 
		autoPlayInterval: 10000,
		autoPlayPauseOnInteraction: true,
		autoPlayResumeDelay: 30000
	}} 
/>
```

### Fast Animations

```svelte
<Globe 
	{locations} 
	{ports} 
	config={{ 
		arcFlightTime: 1500,
		animationDuration: 800,
		ringPropagationSpeed: 6
	}} 
/>
```

## Performance Tips

1. **Limit locations**: Best performance with 5-20 locations
2. **Optimize textures**: Use compressed JPEG images for earth texture
3. **Reduce arc complexity**: Lower `arcStroke` for better performance
4. **Disable features**: Set `autoPlay: false` when not needed

## Browser Support

- Modern browsers with WebGL support
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Dependencies

- `globe.gl` - 3D globe visualization library
- `three` - 3D graphics library (peer dependency of globe.gl)

## License

This component is part of the `@layerd/ui` package.

## Credits

Built with:
- [globe.gl](https://github.com/vasturiano/globe.gl) by Vasco Asturiano
- [Three.js](https://threejs.org/)
