<!-- 
  EnhancedTooltip.svelte - A customizable tooltip component using Tailwind CSS
  with support for both hover-triggered and controlled visibility modes
-->
<script>
  // Props for the tooltip component
  export let text = 'Notification'; // The text to display in the tooltip
  export let position = 'top'; // Position of tooltip: "top", "right", "bottom", or "left"
  export let show = undefined; // For controlled mode - whether the tooltip is visible
  export let variant = 'dark'; // Color variant: "dark" or "light"
  export let size = 'md'; // Size variant: "sm", "md", or "lg"
  export let zIndex = 'z-50'; // Z-index of the tooltip
  export let mode = 'hover'; // "hover" or "controlled"
  export let hideDelay = 0; // Delay in ms before hiding tooltip (for controlled mode)
  export let showDelay = 0; // Delay in ms before showing tooltip (for hover mode)

  // Internal state for hover mode
  let isHovered = false;
  let hoverTimeout;
  let hideTimeout;
  let isVisible = false;

  // Handle mouse enter event
  function handleMouseEnter() {
    if (mode === 'hover') {
      clearTimeout(hideTimeout);
      if (showDelay > 0) {
        hoverTimeout = setTimeout(() => {
          isHovered = true;
        }, showDelay);
      } else {
        isHovered = true;
      }
    }
  }

  // Handle mouse leave event
  function handleMouseLeave() {
    if (mode === 'hover') {
      clearTimeout(hoverTimeout);
      if (hideDelay > 0) {
        hideTimeout = setTimeout(() => {
          isHovered = false;
        }, hideDelay);
      } else {
        isHovered = false;
      }
    }
  }

  // Watch for changes in the show prop when in controlled mode
  $: if (mode === 'controlled' && show !== undefined) {
    if (show === true) {
      isVisible = true;
    } else if (show === false) {
      if (hideDelay > 0) {
        setTimeout(() => {
          isVisible = false;
        }, hideDelay);
      } else {
        isVisible = false;
      }
    }
  }

  // Determine if tooltip should be shown based on mode
  $: shouldShow = mode === 'hover' ? isHovered : isVisible;

  // Calculate position classes based on position prop
  $: positionClasses = getPositionClasses(position);
  $: arrowClasses = getArrowClasses(position, variant);

  // Get variant classes
  $: variantClasses = getVariantClasses(variant);

  // Get size classes
  $: sizeClasses = getSizeClasses(size);

  // Functions to get tailwind classes
  function getPositionClasses(pos) {
    switch (pos) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  }

  function getArrowClasses(pos, variant) {
    const color = variant === 'dark' ? 'surface-100' : 'white';

    switch (pos) {
      case 'top':
        return `absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-t-${color} border-r-transparent border-b-transparent border-l-transparent`;
      case 'right':
        return `absolute -left-4 top-1/2 -translate-y-1/2 border-8 border-t-transparent border-r-${color} border-b-transparent border-l-transparent`;
      case 'bottom':
        return `absolute -top-4 left-1/2 -translate-x-1/2 border-8 border-t-transparent border-r-transparent border-b-${color} border-l-transparent`;
      case 'left':
        return `absolute -right-4 top-1/2 -translate-y-1/2 border-8 border-t-transparent border-r-transparent border-b-transparent border-l-${color}`;
      default:
        return `absolute -bottom-4 left-1/2 -translate-x-1/2 border-8 border-t-${color} border-r-transparent border-b-transparent border-l-transparent`;
    }
  }

  function getVariantClasses(variant) {
    switch (variant) {
      case 'dark':
        return 'bg-surface-100 text-white';
      case 'light':
        return 'bg-white text-surface-100 shadow-lg';
      default:
        return 'bg-surface-100 text-white';
    }
  }

  function getSizeClasses(size) {
    switch (size) {
      case 'sm':
        return 'px-[12px] py-[4px] text-fs-ds-14';
      case 'md':
        return 'px-4 py-2 text-fs-ds-16';
      case 'lg':
        return 'px-6 py-3 text-fs-ds-18';
      default:
        return 'px-4 py-2 text-fs-ds-20';
    }
  }
</script>

<div
  class="relative inline-block"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <slot>
    <!-- Default content to trigger tooltip -->
    <button class="bg-surface-100 rounded px-4 py-2 text-white"> Hover me </button>
  </slot>

  <div
    class="absolute {positionClasses} {variantClasses} {sizeClasses} {zIndex} rounded whitespace-nowrap transition-all duration-300"
    role="tooltip"
    style="transform: scale({shouldShow ? 1 : 0.8}); opacity: {shouldShow ? 1 : 0}; "
  >
    {text}
    <div class={arrowClasses} style="color: #31353F;"></div>
  </div>
</div>
