import { useEffect, useRef } from 'react';

interface WebPagePlayerProps {
  src: string;
  onFatalError: () => void;
}

const CCTV_CSS = `
  html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: #000 !important; }
  .topbox, .header, .nav, .footer, .sidebar, .side, .ad, .ads,
  .cctv_nav, .cctv_footer, .page_footer, .column_nav,
  .lanmu_header, .lanmu_footer, .living_left,
  .scroll-box, .live_wrap, .news_box,
  #header, #footer, #sidebar, #nav, #ad {
    display: none !important;
  }
  .video_box, .player_box, .live_player, .player_container,
  .spaecial_player, #player, #video {
    position: fixed !important;
    top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important;
    z-index: 99999 !important;
    background: #000 !important;
  }
  video, object, embed {
    width: 100% !important; height: 100% !important;
    object-fit: contain !important;
  }
`;

// Intercept window.open and target="_blank" to keep navigation inside the page
const INTERCEPT_NAV_JS = `
  (function() {
    // Override window.open to navigate in place
    window.open = function(url) {
      if (url) window.location.href = url;
      return null;
    };
    // Convert all target="_blank" links to in-page navigation
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (link && link.target === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        if (link.href) window.location.href = link.href;
      }
    }, true);
    // MutationObserver to catch dynamically added links
    new MutationObserver(function() {
      document.querySelectorAll('a[target="_blank"]').forEach(function(a) {
        a.target = '_self';
      });
    }).observe(document.body, { childList: true, subtree: true });
  })();
`;

function shouldInjectCSS(url: string): boolean {
  return url.includes('tv.cctv.com');
}

export function WebPagePlayer({ src, onFatalError }: WebPagePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const webview = document.createElement('webview');
    webview.src = src;
    webview.style.width = '100%';
    webview.style.height = '100%';
    webview.style.border = 'none';
    webview.setAttribute('allowpopups', 'false');
    webview.setAttribute('useragent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');

    webview.addEventListener('dom-ready', () => {
      // Inject JS to intercept navigation for all sites
      webview.executeJavaScript(INTERCEPT_NAV_JS).catch(() => {});

      // Inject CSS for CCTV sites
      if (shouldInjectCSS(src)) {
        webview.insertCSS(CCTV_CSS).catch(() => {});
      }

      // Also try setWindowOpenHandler as backup
      try {
        const wc = (webview as any).getWebContents?.();
        if (wc) {
          wc.setWindowOpenHandler((details: any) => {
            webview.loadURL(details.url);
            return { action: 'deny' };
          });
        }
      } catch {}
    });

    // Re-inject JS on every page navigation (e.g. clicking links)
    webview.addEventListener('did-navigate-in-page', () => {
      webview.executeJavaScript(INTERCEPT_NAV_JS).catch(() => {});
    });
    webview.addEventListener('did-navigate', () => {
      webview.executeJavaScript(INTERCEPT_NAV_JS).catch(() => {});
    });

    webview.addEventListener('did-fail-load', (_e: any) => {
      onFatalError();
    });

    container.appendChild(webview);

    return () => {
      container.innerHTML = '';
    };
  }, [src, onFatalError]);

  return <div ref={containerRef} className="webpage-player" />;
}
