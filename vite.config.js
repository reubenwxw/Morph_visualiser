import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/tiles': 'http://localhost:3001',
      '/pmtiles': 'http://localhost:3001',
      '/catchment': 'http://localhost:3001',
      '/CityRankings2024.json': 'http://localhost:3001'
    }
  }
});
