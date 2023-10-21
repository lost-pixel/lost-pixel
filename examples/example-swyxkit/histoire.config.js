import { defineConfig } from 'histoire'
import { HstSvelte } from '@histoire/plugin-svelte'

export default defineConfig({
  setupFile: '/src/histoire-setup.js',
  plugins: [
    HstSvelte(),
  ],
  // https://histoire.dev/guide/svelte3/hierarchy.html
  tree: {
    groups: [
      {
        id: 'top',
        title: '', // No toggle
      },
      // {
      //   title: 'Components',
      //   include: file => !file.title.includes('Serialize'),
      // },
      {
        title: 'Others',
        include: () => true,
      },
    ],
  },
})