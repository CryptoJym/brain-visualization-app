// RAVE Three-Brain Library Loader
// Handles loading the library from multiple CDN sources with fallback

export async function loadRAVELibrary() {
  console.log('loadRAVELibrary called');
  // Check if already loaded
  if (window.threeBrain) {
    console.log('✅ RAVE library already loaded');
    return true;
  }

  // Try multiple CDN sources
  const sources = [
    {
      url: 'https://unpkg.com/@dipterix/threebrain-js@2.1.0/dist/threebrain.min.js',
      name: 'unpkg (stable)'
    },
    {
      url: 'https://cdn.jsdelivr.net/npm/@dipterix/threebrain-js@2.1.0/dist/threebrain.min.js',
      name: 'jsdelivr (stable)'
    },
    {
      url: 'https://unpkg.com/@dipterix/threebrain-js@latest/dist/threebrain.min.js',
      name: 'unpkg (latest)'
    },
    {
      url: 'https://rave-ieeg.github.io/three-brain-js/dist/threebrain.min.js',
      name: 'official GitHub'
    },
    {
      url: '/libs/threebrain-main.js',
      name: 'local fallback'
    }
  ];

  let lastError = null;

  for (const source of sources) {
    try {
      console.log(`🔄 Attempting to load RAVE from ${source.name}...`);
      await loadScript(source.url);
      
      // Wait for library to initialize
      let attempts = 0;
      while (!window.threeBrain && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (window.threeBrain) {
        console.log(`✅ RAVE successfully loaded from ${source.name}`);
        return true;
      }
    } catch (error) {
      console.warn(`❌ Failed to load from ${source.name}:`, error.message);
      lastError = error;
      
      // Clean up failed script
      const failedScript = document.querySelector(`script[src="${source.url}"]`);
      if (failedScript) {
        failedScript.remove();
      }
    }
  }
  
  throw new Error(`Failed to load RAVE library from all sources. Last error: ${lastError?.message}`);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout loading script from ${src}`));
    }, 10000); // 10 second timeout

    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load script from ${src}`));
    };
    
    document.head.appendChild(script);
  });
}

// Helper to check RAVE version and capabilities
export function checkRAVECapabilities() {
  if (!window.threeBrain) {
    return {
      loaded: false,
      version: null,
      hasViewerApp: false,
      hasUtils: false
    };
  }

  return {
    loaded: true,
    version: window.threeBrain.VERSION || 'unknown',
    hasViewerApp: !!window.threeBrain.ViewerApp,
    hasUtils: !!window.threeBrain.utils,
    availableClasses: Object.keys(window.threeBrain)
  };
}