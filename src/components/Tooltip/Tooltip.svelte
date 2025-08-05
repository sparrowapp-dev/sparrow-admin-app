<script>
  import { onMount, onDestroy, tick } from 'svelte';

  // Props for the tooltip component
  export let text = 'Notification'; // The text to display in the tooltip
  export let position = 'top'; // Position of tooltip: "top", "right", "bottom", or "left"
  export let show = undefined; // For controlled mode - whether the tooltip is visible
  export let variant = 'dark'; // Color variant: "dark" or "light"
  export let size = 'md'; // Size variant: "xs", "sm", "md", "lg"
  export let zIndex = 'z-[9999]'; // High z-index to appear above everything
  export let mode = 'hover'; // "hover" or "controlled"
  export let hideDelay = 0; // Delay in ms before hiding tooltip
  export let showDelay = 0; // Delay in ms before showing tooltip
  export let maxWidth = '250px'; // Maximum width for text wrapping
  export let offset = 8; // Distance from trigger element
  export let allowOverflow = true; // Allow tooltip to escape container bounds

  // Internal state
  let isHovered = false;
  let isVisible = false;
  let hoverTimeout;
  let hideTimeout;
  let triggerElement;
  let mounted = false;

  // Tooltip positioning state
  let tooltipPosition = { x: -9999, y: -9999 }; // Start off-screen to prevent flash
  let actualPosition = position;
  let showTooltip = false; // Controls actual visibility

  function handleScroll() {
    isHovered = false;
    isVisible = false;
    showTooltip = false;
  }

  onMount(() => {
    mounted = true;
    document.addEventListener('scroll', handleScroll, true);
  });

  onDestroy(() => {
    clearTimeout(hoverTimeout);
    clearTimeout(hideTimeout);
    document.removeEventListener('scroll', handleScroll, true);
  });

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

  // Determine if tooltip should be shown
  $: shouldShow = mode === 'hover' ? isHovered : isVisible;

  // Calculate tooltip position when needed
  $: if (shouldShow && mounted && triggerElement) {
    calculateTooltipPosition();
  } else if (!shouldShow) {
    showTooltip = false;
    tooltipPosition = { x: -9999, y: -9999 };
  }

  async function calculateTooltipPosition() {
    if (!triggerElement || !mounted) return;

    await tick();

    // Get trigger element bounds relative to viewport
    const triggerRect = triggerElement.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Check if trigger is inside a constrained container (like dropdown)
    const constrainedContainer = findConstrainedContainer(triggerElement);

    // Estimate tooltip dimensions for collision detection
    const estimatedWidth = Math.min(text.length * 7 + 24, parseInt(maxWidth.replace('px', '')));
    const estimatedHeight = Math.max(40, Math.ceil(text.length / 30) * 20 + 16); // Dynamic height based on text length

    // Calculate all possible positions
    const positions = {
      top: {
        x: triggerRect.left + triggerRect.width / 2 - estimatedWidth / 2,
        y: triggerRect.top - estimatedHeight - offset,
        fits: triggerRect.top - estimatedHeight - offset >= 0,
      },
      bottom: {
        x: triggerRect.left + triggerRect.width / 2 - estimatedWidth / 2,
        y: triggerRect.bottom + offset,
        fits: triggerRect.bottom + estimatedHeight + offset <= viewport.height,
      },
      left: {
        x: triggerRect.left - estimatedWidth - offset,
        y: triggerRect.top + triggerRect.height / 2 - estimatedHeight / 2,
        fits: triggerRect.left - estimatedWidth - offset >= 0,
      },
      right: {
        x: triggerRect.right + offset,
        y: triggerRect.top + triggerRect.height / 2 - estimatedHeight / 2,
        fits: triggerRect.right + estimatedWidth + offset <= viewport.width,
      },
    };

    // If we're in a constrained container and allowOverflow is true, prioritize positions that escape the container
    let bestPosition = position;

    if (constrainedContainer && allowOverflow) {
      const containerRect = constrainedContainer.getBoundingClientRect();

      // Check which positions would escape the container bounds
      const escapingPositions = Object.entries(positions).filter(([pos, coords]) => {
        if (pos === 'top' || pos === 'bottom') {
          return coords.y < containerRect.top || coords.y + estimatedHeight > containerRect.bottom;
        } else {
          return coords.x < containerRect.left || coords.x + estimatedWidth > containerRect.right;
        }
      });

      // Prefer escaping positions that also fit in viewport
      const goodEscapingPositions = escapingPositions.filter(([pos, coords]) => coords.fits);

      if (goodEscapingPositions.length > 0) {
        // Prefer original position if it escapes and fits, otherwise take first good escaping position
        const originalEscapes = goodEscapingPositions.find(([pos]) => pos === position);
        bestPosition = originalEscapes ? originalEscapes[0] : goodEscapingPositions[0][0];
      } else if (escapingPositions.length > 0) {
        // If no escaping positions fit viewport, still try to escape even if clipped
        bestPosition = escapingPositions[0][0];
      }
    }

    // Fallback: if chosen position doesn't fit viewport, find any that does
    if (!positions[bestPosition]?.fits) {
      const fittingPosition = Object.entries(positions).find(([pos, coords]) => coords.fits);
      if (fittingPosition) {
        bestPosition = fittingPosition[0];
      }
    }

    actualPosition = bestPosition;
    const pos = positions[bestPosition];

    // Calculate final position with boundary adjustments
    let finalX = pos.x;
    let finalY = pos.y;

    // Adjust for viewport boundaries (but allow some overflow if in constrained container)
    const margin = constrainedContainer && allowOverflow ? 4 : 8;
    finalX = Math.max(margin, Math.min(finalX, viewport.width - estimatedWidth - margin));
    finalY = Math.max(margin, Math.min(finalY, viewport.height - estimatedHeight - margin));

    // Set position and then show tooltip to avoid animation from (0,0)
    tooltipPosition = { x: finalX, y: finalY };

    // Small delay to ensure position is set before showing
    setTimeout(() => {
      showTooltip = true;
    }, 10);
  }

  // Find the nearest container that might constrain the tooltip
  function findConstrainedContainer(element) {
    let parent = element.parentElement;

    while (parent && parent !== document.body) {
      const style = window.getComputedStyle(parent);

      // Check for containers that would clip content
      if (
        style.overflow === 'hidden' ||
        style.overflow === 'scroll' ||
        style.overflow === 'auto' ||
        style.overflowX === 'hidden' ||
        style.overflowY === 'hidden' ||
        (style.position === 'relative' && (style.maxHeight !== 'none' || style.maxWidth !== 'none'))
      ) {
        return parent;
      }

      parent = parent.parentElement;
    }

    return null;
  }

  function getVariantClasses(variant) {
    switch (variant) {
      case 'dark':
        return 'bg-surface-100 text-white border border-surface-200';
      case 'light':
        return 'bg-white text-surface-800 shadow-lg border border-gray-200';
      default:
        return 'bg-surface-100 text-white border border-surface-200';
    }
  }

  function getSizeClasses(size) {
    switch (size) {
      case 'xs':
        return 'text-xs';
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-sm';
      case 'lg':
        return 'text-base';
      default:
        return 'text-sm';
    }
  }

  function getPaddingClasses(size) {
    switch (size) {
      case 'xs':
        return 'px-2 py-1';
      case 'sm':
        return 'px-3 py-1.5';
      case 'md':
        return 'px-3 py-2';
      case 'lg':
        return 'px-4 py-2';
      default:
        return 'px-3 py-2';
    }
  }

  function getArrowClasses(pos) {
    switch (pos) {
      case 'top':
        return 'absolute top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-current';
      case 'bottom':
        return 'absolute bottom-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-current';
      case 'left':
        return 'absolute left-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-current';
      case 'right':
        return 'absolute right-full top-1/2 -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-current';
      default:
        return 'absolute top-full left-1/2 -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-current';
    }
  }

  // Get computed classes
  $: variantClasses = getVariantClasses(variant);
  $: sizeClasses = getSizeClasses(size);
  $: paddingClasses = getPaddingClasses(size);
  $: arrowClasses = getArrowClasses(actualPosition);
</script>

<div
  class="relative inline-block"
  bind:this={triggerElement}
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
>
  <slot>
    <!-- Default content to trigger tooltip -->
    <button class="bg-surface-100 rounded px-4 py-2 text-white">Hover me</button>
  </slot>
</div>

<!-- Tooltip rendered with fixed positioning -->
{#if shouldShow && mounted}
  <div
    class="fixed {variantClasses} {sizeClasses} {zIndex} pointer-events-none rounded break-words whitespace-normal shadow-lg"
    style="
      left: {tooltipPosition.x}px;
      top: {tooltipPosition.y}px;
      max-width: {maxWidth};
      opacity: {showTooltip ? 1 : 0};
      visibility: {showTooltip ? 'visible' : 'hidden'};
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      line-height: 1.4;
      transition: opacity 150ms ease-in-out;
    "
    role="tooltip"
    aria-hidden={!showTooltip}
  >
    <div class="relative font-fw-ds-300 {paddingClasses}">
      {text}
      <!-- Arrow - positioned relative to tooltip container, not content -->
      <div class="{arrowClasses} text-surface-100"></div>
    </div>
  </div>
{/if}

<style>
  /* Ensure long words break properly */
  :global(.tooltip-content) {
    word-break: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
  }
</style>
