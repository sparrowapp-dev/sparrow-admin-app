<script lang="ts">
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import { defaultDonutConfig, type DonutChartData, type DonutChartConfig } from './widgets.config';

  export let data: DonutChartData[] = [];
  export let width: number = 300;
  export let height: number = 300;
  export let config: Partial<DonutChartConfig> = {};
  export let showTotal: boolean = true;

  // Merge provided config with defaults
  $: mergedConfig = { ...defaultDonutConfig, ...config };
  $: total = data.reduce((sum, d) => sum + d.value, 0);

  let svgElement: SVGSVGElement;
  let chartGroup: d3.Selection<SVGGElement, unknown, null, undefined>;
  let container: HTMLDivElement;
  let innerWidth: number;
  let innerHeight: number;

  // Create a resize observer
  let resizeObserver: ResizeObserver;

  function createChart() {
    if (!svgElement || !data.length) return;

    // Clear previous chart
    d3.select(svgElement).selectAll('*').remove();

    // Set up dimensions
    const containerRect = container.getBoundingClientRect();
    innerWidth = containerRect.width;
    innerHeight = containerRect.height;

    const radius = Math.min(innerWidth, innerHeight) / 2;

    // Set up SVG
    const svg = d3
      .select(svgElement)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create chart group at the center
    chartGroup = svg
      .append('g')
      .attr('transform', `translate(${innerWidth / 2},${innerHeight / 2})`);

    // Set up pie and arc generators
    const pie = d3
      .pie<DonutChartData>()
      .sort(null)
      .value((d) => d.value);

    const arc = d3
      .arc<d3.PieArcDatum<DonutChartData>>()
      .innerRadius(radius * mergedConfig.innerRadius)
      .outerRadius(radius * mergedConfig.outerRadius)
      .cornerRadius(mergedConfig.cornerRadius || 0)
      .padAngle(mergedConfig.padAngle || 0);

    // Draw arcs
    const arcs = chartGroup
      .selectAll('path')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('fill', (d) => d.data.color)
      .attr('d', arc)
      .attr('stroke', 'none')
      .style('transition', `all ${mergedConfig.transitionDuration}ms`);

    // Add total in the center if enabled
    if (showTotal) {
      chartGroup
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-family', 'Inter, sans-serif')
        .style('font-weight', 500)
        .style('fill', '#FFFFFF')
        .style('font-size', `24px`)
        .text(total);
    }
  }

  function handleResize() {
    if (mergedConfig.responsive && container) {
      createChart();
    }
  }

  onMount(() => {
    if (mergedConfig.responsive) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    }

    createChart();
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
  });

  $: if (data && svgElement) {
    createChart();
  }
</script>

<div class="relative h-full min-h-[200px] w-full" bind:this={container}>
  <svg bind:this={svgElement} class="block"></svg>
</div>
