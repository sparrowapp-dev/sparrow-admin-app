<script lang="ts">
  export let size = 34;
  export let color = '#6894f9';
  export let thickness = 0.1;
  export let duration = 1.2;

  // Calculate dimensions based on size
  $: strokeWidth = size * thickness;
  $: radius = size / 2 - strokeWidth;
  $: circumference = 2 * Math.PI * radius;

  // Unique ID to avoid conflicts
  $: loaderId = `loader-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div
  class="relative inline-flex items-center justify-center"
  style="height: {size}px; width: {size}px;"
>
  <svg
    width={size}
    height={size}
    viewBox="0 0 {size} {size}"
    xmlns="http://www.w3.org/2000/svg"
    class="loader-svg"
  >
    <!-- Background circle (optional) -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke="rgba(255, 255, 255, 0.1)"
      stroke-width={strokeWidth}
    />

    <!-- Animated loader circle -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      fill="none"
      stroke={color}
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={circumference * 0.75}
      class="spinner-circle"
      style="--duration: {duration}s;"
    />
  </svg>
</div>

<style>
  .loader-svg {
    /* Ensure proper rendering on all browsers */
    shape-rendering: geometricPrecision;
  }

  .spinner-circle {
    transform-origin: center;
    animation: spin var(--duration) linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Safari-specific fixes */
  @supports (-webkit-appearance: none) {
    .spinner-circle {
      /* Force hardware acceleration on Safari */
      transform: translateZ(0);
      will-change: transform;
    }
  }
</style>
