export interface DonutChartConfig {
  innerRadius: number;
  outerRadius: number;
  thickness?: number;
  cornerRadius?: number;
  padAngle?: number;
  transitionDuration?: number;
  responsive?: boolean;
}

export const defaultDonutConfig: DonutChartConfig = {
  innerRadius: 0.6, // 60% of the outer radius
  outerRadius: 1, // 100% of the outer radius
  thickness: 30, // 30px thickness
  cornerRadius: 4, // 4px corner radius
  padAngle: 0.02, // 2% padding angle
  transitionDuration: 750, // 750ms transition duration
  responsive: true, // Responsive design
};

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  data: DonutChartData[];
  width?: number;
  height?: number;
  config?: Partial<DonutChartConfig>;
}

export interface TrendLineConfig {
  responsive?: boolean;
  transitionDuration?: number;
  showPoints?: boolean;
  lineWidth?: number;
  pointRadius?: number;
  yAxisTicks?: number;
  curveType?: 'linear' | 'monotone' | 'natural';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  showGrid?: boolean;
  useGradient?: boolean;
  whitePoints?: boolean;
  showAxisLines?: boolean;
  showAxisTicks?: boolean;
  useShadows?: boolean;
}

export const defaultTrendLineConfig: TrendLineConfig = {
  responsive: true,
  transitionDuration: 750,
  showPoints: true,
  lineWidth: 2,
  pointRadius: 4,
  yAxisTicks: 5,
  curveType: 'monotone',
  margin: {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50,
  },
  showGrid: true,
  useGradient: true,
  whitePoints: true,
  showAxisLines: true,
  showAxisTicks: true,
  useShadows: false,
};

export interface TrendLineDataPoint {
  date: string | Date;
  value: number;
}

export interface TrendLineSeries {
  name: string;
  color: string;
  data: TrendLineDataPoint[];
}

export interface TrendLineData {
  series: TrendLineSeries[];
}
