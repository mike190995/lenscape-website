import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        motionmagic: resolve(__dirname, 'motionmagic.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        contact: resolve(__dirname, 'contact.html'),
        eventlabs: resolve(__dirname, 'eventlabs/index.html'),
        eventlabs_portfolio: resolve(__dirname, 'eventlabs/portfolio.html'),
        eventlabs_motionmagic: resolve(__dirname, 'eventlabs/motionmagic.html'),
        eventlabs_contact: resolve(__dirname, 'eventlabs/contact.html')
      }
    }
  }
})
