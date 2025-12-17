import path from "path";
import { defineConfig, loadEnv, Plugin } from "vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import tsconfigPaths from "vite-tsconfig-paths";

// Custom plugin for manual refresh with HMR disabled
function manualRefreshPlugin(): Plugin {
  return {
    name: 'manual-refresh',
    configureServer(server) {
      // Add endpoint to clear module graph and trigger refresh
      server.middlewares.use('/__manual_refresh', async (req, res) => {
        console.log('Manual refresh triggered - clearing module graph');

        // Clear the module graph
        const modules = [...server.moduleGraph.urlToModuleMap.values()];
        for (const mod of modules) {
          await server.moduleGraph.invalidateModule(mod);
        }

        // Send success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, cleared: modules.length }));
      });
    },
    transformIndexHtml() {
      // Inject the manual refresh button
      return [
        {
          tag: 'script',
          injectTo: 'body',
          children: `
            (function() {
              const button = document.createElement('button');
              button.id = 'vite-refresh-button';
              button.innerHTML = '🔄 Refresh';
              button.style.cssText = \`
                position: fixed;
                right: 20px;
                z-index: 0;
                padding: 12px 20px;
                background: #646cff;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                transition: all 0.2s;
                bottom: 60px;
              \`;

              button.onmouseover = () => {
                button.style.background = '#535bf2';
                button.style.transform = 'scale(1.05)';
              };

              button.onmouseout = () => {
                button.style.background = '#646cff';
                button.style.transform = 'scale(1)';
              };

              button.onclick = async () => {
                button.disabled = true;
                button.innerHTML = '⏳ Refreshing...';

                try {
                  await fetch('/__manual_refresh');
                  setTimeout(() => window.location.reload(), 200);
                } catch (err) {
                  console.error('Refresh failed:', err);
                  button.innerHTML = '❌ Failed';
                  setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '🔄 Refresh';
                  }, 2000);
                }
              };

              document.body.appendChild(button);

              // Add keyboard listener for Ctrl+H to toggle refresh button visibility
              let isHidden = false;
              document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'h') {
                  e.preventDefault();
                  isHidden = !isHidden;
                  button.style.display = isHidden ? 'none' : 'block';

                  // Dispatch custom event for React components to listen
                  window.dispatchEvent(new CustomEvent('toggleUIVisibility', { detail: { hidden: isHidden } }));
                }
              });
            })();
          `
        }
      ];
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [tsconfigPaths(), cssInjectedByJsPlugin(), manualRefreshPlugin()],
    base: './',
    server: {
      hmr: false, // Disable Hot Module Replacement
      fs: {
        allow: ['..'], // Allow access to parent directory (project root) for Outputs folder
      },
    },
    css: {
      postcss: "./postcss.config.js",
    },
    define: {
      "process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
      "process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      target: "esnext",
      outDir: "dist",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
        },
      },
    },
  };
});
