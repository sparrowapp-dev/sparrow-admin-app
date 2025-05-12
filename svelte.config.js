import sveltePreprocess from 'svelte-preprocess';
import path from 'path';

export default {
  preprocess: sveltePreprocess(),
  kit: {
    alias: {
      $components: path.resolve('./src/components'),
      $utils: path.resolve('./src/utils'),
    },
  },
};
