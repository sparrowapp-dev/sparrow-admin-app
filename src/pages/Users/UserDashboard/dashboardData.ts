export const userDistributionData = [
  { label: 'Admin', value: 35, color: '#2B9ACA' },
  { label: 'Members', value: 65, color: '#CA2689' },
];

export const trendData = {
  series: [
    {
      name: 'Admin',
      color: '#30A5D6',
      data: [
        { date: '2023-01-01', value: 10 },
        { date: '2023-02-01', value: 15 },
        { date: '2023-03-01', value: 20 },
        { date: '2023-04-01', value: 24 },
        { date: '2023-05-01', value: 28 },
        { date: '2023-06-01', value: 40 },
        { date: '2023-07-01', value: 30 },
        { date: '2023-08-01', value: 34 },
        { date: '2023-09-01', value: 38 },
        { date: '2023-10-01', value: 41 },
        { date: '2023-11-01', value: 45 },
        { date: '2023-12-01', value: 48 },
      ],
    },
    {
      name: 'Member',
      color: '#E5259B',
      data: [
        { date: '2023-01-01', value: 20 },
        { date: '2023-02-01', value: 28 },
        { date: '2023-03-01', value: 32 },
        { date: '2023-04-01', value: 36 },
        { date: '2023-05-01', value: 38 },
        { date: '2023-06-01', value: 42 },
        { date: '2023-07-01', value: 45 },
        { date: '2023-08-01', value: 48 },
        { date: '2023-09-01', value: 50 },
        { date: '2023-10-01', value: 54 },
        { date: '2023-11-01', value: 56 },
        { date: '2023-12-01', value: 59 },
      ],
    },
  ],
};

// graph configs

export const pieChartConfig = {
  innerRadius: 0.65,
  outerRadius: 1,
  padAngle: 0,
  cornerRadius: 0,
};

export const trendLineConfig = {
  curveType: 'monotone',
  showPoints: true,
  pointRadius: 5,
  lineWidth: 2,
  yAxisTicks: 5,
  showGrid: false,
  margin: {
    top: 20,
    right: 0,
    bottom: 40,
    left: 0,
  },
  useGradient: false,
  whitePoints: true,
  showAxisLines: false,
  showAxisTicks: true,
  responsive: true,
  useShadows: true,
};
