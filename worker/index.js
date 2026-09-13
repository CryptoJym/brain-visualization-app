export {PortraitService} from './portraits/service.mjs';
export const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};
export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname.startsWith('/api/portraits/')) {
      if (!env.PORTRAIT_SERVICE) return Response.json({available:false,error:'service_not_configured'},{status:503,headers:{'Cache-Control':'no-store'}});
      const id=env.PORTRAIT_SERVICE.idFromName('cortex-private-portraits-v1');
      return env.PORTRAIT_SERVICE.get(id).fetch(request);
    }
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
    // Revalidate static HTML and prevent automatic third-party script injection.
    if (response.headers.get('Content-Type')?.includes('text/html')) response.headers.set('Cache-Control', 'public, no-cache, no-transform');
    return response;
  },
};
