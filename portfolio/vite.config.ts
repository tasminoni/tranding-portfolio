import {defineConfig,loadEnv} from 'vite';
import {fileURLToPath} from 'node:url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({mode})=>{
 const env=loadEnv(mode,fileURLToPath(new URL('.',import.meta.url)),'VITE_');
 const base=env.VITE_BASE_PATH || '/';
 const siteUrl=env.VITE_SITE_URL?.trim();
 if(!base.startsWith('/') || !base.endsWith('/'))throw new Error('VITE_BASE_PATH must start and end with /');
 const escapedSiteUrl=siteUrl ? new URL(siteUrl).href.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;') : '';
 return {
  base,
  plugins:[
   tailwindcss(),
   {
    name:'deployment-metadata',
    transformIndexHtml(html){
     if(!escapedSiteUrl)return html;
     return html
      .replace(/(<meta property="og:url" content=")[^"]*(")/,(_all,start,end)=>start+escapedSiteUrl+end)
      .replace(/(<link rel="canonical" href=")[^"]*(")/,(_all,start,end)=>start+escapedSiteUrl+end);
    }
   }
  ],
  build:{rollupOptions:{onwarn(warning,warn){
   if(warning.code==='MODULE_LEVEL_DIRECTIVE'&&warning.message.includes('use client'))return;
   warn(warning);
  }}}
 };
});
