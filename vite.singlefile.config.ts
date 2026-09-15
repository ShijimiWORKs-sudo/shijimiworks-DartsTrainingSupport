import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/**
 * Separate build used only to produce a single, fully self-contained
 * HTML file (JS + CSS inlined, no external requests) for embedding this
 * app inside other hosts that can only serve one static blob — e.g. a
 * Streamlit page via st.components.v1.html (see streamlit_app.py).
 *
 * Run with: npm run build:embed
 * Output:   static/embed.html (Streamlit's static-file-serving folder,
 *           see .streamlit/config.toml's enableStaticServing = true)
 *
 * This is NOT what gets deployed on its own — the normal `npm run build`
 * (vite.config.ts) is still the real production build for static hosting.
 * This file must be rebuilt and committed whenever the app changes and the
 * Streamlit embed needs to reflect it (Streamlit Cloud only runs Python,
 * it does not run `npm run build` for us).
 */
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  publicDir: false,
  build: {
    outDir: 'static',
    emptyOutDir: false,
    cssCodeSplit: false,
  },
});
