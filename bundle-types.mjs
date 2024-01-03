import { createBundle } from 'dts-buddy'

await createBundle({
  project: 'tsconfig.json',
  output: 'dist/index.d.ts',
  modules: {
    '@reconbot/exif-library': './lib/index.ts',
  },
})
