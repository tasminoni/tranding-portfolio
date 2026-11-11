import {chromium} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
await mkdir(new URL('../public/assets/projects/',import.meta.url),{recursive:true});
const b=await chromium.launch({channel:'chrome'});
try{
await Promise.allSettled([['clothigo','https://www.clothigo.com/'],['trustpoint','https://www.trustpointpharma.com/'],['boiporibar','https://www.boiporibar.com/']].map(async([name,url])=>{
const p=await b.newPage({viewport:{width:1440,height:960},deviceScaleFactor:1});
try{const response=await p.goto(url,{waitUntil:'domcontentloaded',timeout:25000});await p.waitForTimeout(2500);const title=await p.title();const body=await p.locator('body').innerText();if(!response?.ok()||/captcha|verify you are human|access denied|just a moment/i.test(title+' '+body.slice(0,1000)))throw Error('Site unavailable or verification page');await p.screenshot({path:fileURLToPath(new URL('../public/assets/projects/'+name+'.png',import.meta.url)),timeout:12000});console.log(JSON.stringify({name,url,title,screenshot:true}));}catch(e){console.log(JSON.stringify({name,screenshot:false,error:e.message}))}finally{await p.close()}
}));
}finally{await b.close()}
