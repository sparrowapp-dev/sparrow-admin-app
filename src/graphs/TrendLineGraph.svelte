<script lang="ts">
  // @ts-nocheck
  import { onMount, onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import {
    defaultTrendLineConfig,
    type TrendLineConfig,
    type TrendLineData,
  } from './widgets.config';

  export let data: TrendLineData;
  export let height = 400;
  export let config: Partial<TrendLineConfig> = {};

  // Merge provided config with defaults
  $: mergedConfig = { ...defaultTrendLineConfig, ...config };

  let svgElement: SVGSVGElement;
  let container: HTMLDivElement;
  let innerWidth: number;
  let innerHeight: number;
  let resizeObserver: ResizeObserver;

  function createChart() {
    if (!svgElement || !data || !data.series.length) return;

    // Clear previous chart
    d3.select(svgElement).selectAll('*').remove();

    // Set up dimensions
    const containerRect = container.getBoundingClientRect();
    innerWidth = containerRect.width;
    innerHeight = height;

    const margin = mergedConfig.margin!;
    const width = innerWidth - margin.left - margin.right;
    const chartHeight = innerHeight - margin.top - margin.bottom;

    // Set up SVG
    const svg = d3
      .select(svgElement)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create chart group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // --- SVG FILTERS FOR SHADOWS ---
    const defs = svg.append('defs');
    if (mergedConfig.useShadows) {
      data.series.forEach((series, i) => {
        defs
          .append('filter')
          .attr('id', `shadow-${i}`)
          .attr('x', '-30%')
          .attr('y', '-30%')
          .attr('width', '160%')
          .attr('height', '160%').html(`
              <feDropShadow dx="0" dy="8" stdDeviation="3" flood-color="${series.color}" flood-opacity="0.4"/>
              <feDropShadow dx="0" dy="6" stdDeviation="9" flood-color="${series.color}" flood-opacity="0.2"/>
              <feDropShadow dx="0" dy="9" stdDeviation="18" flood-color="${series.color}" flood-opacity="0.1"/>
            `);
      });
    }

    // Create a gradient for each series
    data.series.forEach((series, i) => {
      const gradient = defs
        .append('linearGradient')
        .attr('id', `line-gradient-${i}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', series.color)
        .attr('stop-opacity', 0.4);

      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', series.color)
        .attr('stop-opacity', 0);
    });

    // Find the min/max dates across all series
    const allDates = data.series.flatMap((series) => series.data).map((d) => new Date(d.date));
    const minDate = d3.min(allDates) || new Date();
    const maxDate = d3.max(allDates) || new Date();

    // Find the min/max values across all series
    const allValues = data.series.flatMap((series) => series.data).map((d) => d.value);
    const maxValue = d3.max(allValues) || 100;
    const minValue = d3.min(allValues) || 0;

    // Set up scales
    const xScale = d3.scaleTime().domain([minDate, maxDate]).range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, maxValue * 1.2])
      .range([chartHeight, 0]);

    // Create axes with conditional rendering for lines and ticks
    const xAxis = d3.axisBottom(xScale).ticks(12).tickFormat(d3.timeFormat('%b'));
    if (!mergedConfig.showAxisTicks) xAxis.tickSize(0);

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(mergedConfig.yAxisTicks)
      .tickFormat((d) => `${d}`);
    if (!mergedConfig.showAxisTicks) yAxis.tickSize(0);

    // Add X-axis
    const xAxisGroup = g
      .append('g')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter')
      .attr('font-weight', 300)
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis);

    if (!mergedConfig.showAxisLines) {
      xAxisGroup.select('.domain').attr('opacity', 0);
    } else {
      xAxisGroup.select('.domain').attr('stroke', '#444');
    }
    xAxisGroup
      .selectAll('.tick line')
      .attr('stroke', mergedConfig.showAxisTicks ? '#181C26' : 'transparent');
    xAxisGroup
      .selectAll('.tick text')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter')
      .attr('font-weight', 300);

    // Add Y-axis
    const yAxisGroup = g
      .append('g')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter')
      .attr('font-weight', 300)
      .call(yAxis);

    if (!mergedConfig.showAxisLines) {
      yAxisGroup.select('.domain').attr('opacity', 0);
    } else {
      yAxisGroup.select('.domain').attr('stroke', '#444');
    }
    yAxisGroup
      .selectAll('.tick line')
      .attr('stroke', mergedConfig.showAxisTicks ? '#181C26' : 'transparent');
    yAxisGroup
      .selectAll('.tick text')
      .attr('fill', '#fff')
      .attr('font-size', '12px')
      .attr('font-family', 'Inter')
      .attr('font-weight', 300);

    // Add grid lines (optional)
    if (mergedConfig.showGrid) {
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(
          d3
            .axisBottom(xScale)
            .ticks(12)
            .tickSize(-chartHeight)
            .tickFormat(() => ''),
        )
        .selectAll('line')
        .attr('stroke', '#333')
        .attr('stroke-opacity', 0.3);

      g.append('g')
        .attr('class', 'grid')
        .call(
          d3
            .axisLeft(yScale)
            .ticks(mergedConfig.yAxisTicks)
            .tickSize(-width)
            .tickFormat(() => ''),
        )
        .selectAll('line')
        .attr('stroke', '#333')
        .attr('stroke-opacity', 0.3);

      g.selectAll('.grid .domain').attr('opacity', 0);
    }

    // Define line generator with curve
    let curve;
    if (mergedConfig.curveType === 'linear') {
      curve = d3.curveLinear;
    } else if (mergedConfig.curveType === 'natural') {
      curve = d3.curveNatural;
    } else {
      curve = d3.curveMonotoneX;
    }

    const line = d3
      .line<any>()
      .x((d) => xScale(new Date(d.date)))
      .y((d) => yScale(d.value))
      .curve(curve);

    const area = d3
      .area<any>()
      .x((d) => xScale(new Date(d.date)))
      .y0(chartHeight)
      .y1((d) => yScale(d.value))
      .curve(curve);

    // Draw areas and lines for each series
    data.series.forEach((series, i) => {
      // Draw area with gradient fill first (below the line)
      if (mergedConfig.useGradient) {
        g.append('path')
          .datum(series.data)
          .attr('fill', `url(#line-gradient-${i})`)
          .attr('d', area);
      }

      // Draw the line with shadow if enabled
      g.append('path')
        .datum(series.data)
        .attr('fill', 'none')
        .attr('stroke', series.color)
        .attr('stroke-width', mergedConfig.lineWidth)
        .attr('d', line)
        .attr('filter', mergedConfig.useShadows ? `url(#shadow-${i})` : null);

      // Add points if configured
      if (mergedConfig.showPoints) {
        g.selectAll(`.point-${series.name}`)
          .data(series.data)
          .enter()
          .append('circle')
          .attr('class', `point-${series.name}`)
          .attr('cx', (d) => xScale(new Date(d.date)))
          .attr('cy', (d) => yScale(d.value))
          .attr('r', mergedConfig.pointRadius)
          .attr('fill', mergedConfig.whitePoints ? '#fff' : series.color)
          .attr('stroke', series.color)
          .attr('stroke-width', mergedConfig.whitePoints ? 2 : 1);
      }
    });
  }

  function handleResize() {
    if (mergedConfig.responsive) {
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
  <svg bind:this={svgElement} class="block h-full w-full"></svg>
</div>
