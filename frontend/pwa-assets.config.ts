import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Generates the app icons in public/ from the tally mark: npm run generate-icons
// iOS shows transparent icons on black, so the opaque ones sit on brand cream.
const cream = { background: '#F3E6C8', fit: 'contain' } as const

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: cream },
    apple: { ...minimal2023Preset.apple, resizeOptions: cream },
  },
  images: ['public/tally-mark.svg'],
})
