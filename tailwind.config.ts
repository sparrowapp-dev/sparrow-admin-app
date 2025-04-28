import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      // design system for line height
      lineHeight: {
        'lh-ds-auto': 'auto',
        'lh-ds-143': '1.43',
        'lh-ds-150': '1.5',
        'lh-ds-130': '1.3',
        'lh-ds-120': '1.2',
        'lh-ds-200': '2',
      },
      // design system for font weight
      fontWeight: {
        light: '300',
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      // design system for font size
      fontSize: {
        'fs-ds-52': '3.25rem', // 52px
        'fs-ds-48': '3rem', // 48px
        'fs-ds-42': '2.625rem', // 42px
        'fs-ds-30': '1.875rem', // 30px
        'fs-ds-28': '1.75rem', // 28px
        'fs-ds-24': '1.5rem', // 24px
        'fs-ds-20': '1.25rem', // 20px
        'fs-ds-18': '1.125rem', // 18px
        'fs-ds-16': '1rem', // 16px
        'fs-ds-14': '0.875rem', // 14px
        'fs-ds-12': '0.75rem', // 12px
      },
      // design system for colors
      colors: {
        // Blue palette
        'blue-50': '#dbe5fe',
        'blue-100': '#c2d4fd',
        'blue-200': '#8aacfa',
        'blue-300': '#6894f9',
        'blue-400': '#316cf6',
        'blue-500': '#2854b9',
        'blue-600': '#1f418f',
        'blue-700': '#18336f',
        'blue-800': '#10224b',
        'blue-900': '#0a142d',

        // Purple palette
        'purple-50': '#e2deff',
        'purple-100': '#cfc7ff',
        'purple-200': '#a394ff',
        'purple-300': '#8975ff',
        'purple-400': '#6147ff',
        'purple-500': '#4935bf',
        'purple-600': '#382994',
        'purple-700': '#2c2073',
        'purple-800': '#1d154d',
        'purple-900': '#110d2e',

        // Green palette
        'green-50': '#d4eddc',
        'green-100': '#bce6ca',
        'green-200': '#9cdeb2',
        'green-300': '#6ce096',
        'green-400': '#33cc7a',
        'green-500': '#19b259',
        'green-600': '#1a8948',
        'green-700': '#14522e',
        'green-800': '#113b21',
        'green-900': '#0f2416',

        // Red palette
        'red-50': '#fddad8',
        'red-100': '#fab7b7',
        'red-200': '#f79b97',
        'red-300': '#f37472',
        'red-400': '#eb5651',
        'red-500': '#ad2b29',
        'red-600': '#841f1f',
        'red-700': '#621b18',
        'red-800': '#3d1514',
        'red-900': '#240f0f',

        // Yellow palette
        'yellow-50': '#fff3cc',
        'yellow-100': '#feedb5',
        'yellow-200': '#fce392',
        'yellow-300': '#f6d86f',
        'yellow-400': '#ecc551',
        'yellow-500': '#d6a81f',
        'yellow-600': '#98781b',
        'yellow-700': '#655215',
        'yellow-800': '#3d3212',
        'yellow-900': '#251f0e',

        // Orange palette
        'orange-50': '#fbe6da',
        'orange-100': '#f8d5c1',
        'orange-200': '#f2ae88',
        'orange-300': '#ef9765',
        'orange-400': '#e97432',
        'orange-500': '#af5725',
        'orange-600': '#87431d',
        'orange-700': '#693417',
        'orange-800': '#46230f',
        'orange-900': '#2a1509',

        // Pink palette
        'pink-50': '#f5d8ea',
        'pink-100': '#efbddb',
        'pink-200': '#e081bb',
        'pink-300': '#d75ca7',
        'pink-400': '#ca2689',
        'pink-500': '#971c67',
        'pink-600': '#751650',
        'pink-700': '#5b113e',
        'pink-800': '#3d0b29',
        'pink-900': '#240719',

        // Cyan palette
        'cyan-50': '#dceff4',
        'cyan-100': '#b5deee',
        'cyan-200': '#89cde6',
        'cyan-300': '#5ec5ed',
        'cyan-400': '#11adf0',
        'cyan-500': '#2b9aca',
        'cyan-600': '#2b6f88',
        'cyan-700': '#214d5e',
        'cyan-800': '#153139',
        'cyan-900': '#0f2024',

        // Neutral palette
        'neutral-50': '#ffffff',
        'neutral-100': '#d8d8d9',
        'neutral-200': '#b6b7b9',
        'neutral-300': '#9b9da1',
        'neutral-400': '#82858a',
        'neutral-500': '#62656a',
        'neutral-600': '#3d3f43',
        'neutral-700': '#2a2c32',
        'neutral-800': '#181a20',
        'neutral-900': '#0b0c0f',

        // Surface palette
        'surface-50': '#414858',
        'surface-100': '#31353f',
        'surface-200': '#2d2e39',
        'surface-300': '#272935',
        'surface-400': '#222630',
        'surface-500': '#1d212b',
        'surface-600': '#181c26',
        'surface-700': '#14181f',
        'surface-800': '#101318',
        'surface-900': '#0b0c0f',
      },
    },
  },
  plugins: [],
};

export default config;
