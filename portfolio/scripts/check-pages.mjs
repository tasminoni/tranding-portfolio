import {build} from 'vite';
import express from 'express';
import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const previousBase=process.env.VITE_BASE_PATH,previousUrl=process.env.VITE_SITE_URL;
const browser=await chromium.launch({channel:'chrome'});
try{
 for(const [label,base] of [['root','/'],['repository','/sample-portfolio/']]){
  const expectedUrl='https://example.github.io'+base;
  process.env.VITE_BASE_PATH=base;process.env.VITE_SITE_URL=expectedUrl;
  const outDir=fileURLToPath(new URL('../qa/pages-'+label,import.meta.url));
  await build({root,build:{outDir,emptyOutDir:true},logLevel:'warn'});
  const app=express();app.use(base,express.static(outDir));
  const server=app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:')&&r.status()>=400)missing.push(r.url())});
  const origin='http://127.0.0.1:'+server.address().port;
  try{
   await page.goto(origin+base,{waitUntil:'domcontentloaded'});
   await expect(page.getByTestId('build-sequence')).toBeVisible();
   await page.getByRole('button',{name:'Skip build intro'}).click();
   await expect(page.locator('h1')).toBeVisible();
   await expect(page.locator('.presence-trigger')).toContainText('offline');
   await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href',expectedUrl);
   await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content',expectedUrl);
   const resume=await page.locator('a[download]').first().getAttribute('href');
   assert.equal(resume,base+'assets/tasmin-ahmed-resume.pdf');
   const pdf=await page.request.get(origin+resume);assert.equal(pdf.status(),200);
   assert.ok((await pdf.body()).subarray(0,5).toString()==='%PDF-');
   const cover=page.locator('.project-art img').first();await cover.scrollIntoViewIfNeeded();
   await expect(cover).toHaveAttribute('src',base+'assets/projects/clothigo.png');
   await expect.poll(()=>cover.evaluate(img=>img.naturalWidth)).toBeGreaterThan(0);
   const icon=await page.locator('link[rel="icon"]').getAttribute('href');
   assert.equal((await page.request.get(origin+icon)).status(),200);
   const config=await page.request.get(origin+base+'api/presence-config');
   assert.deepEqual(await config.json(),{enabled:false});
   await page.getByRole('button',{name:'View Clothigo project details'}).click();
   await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   console.log('PASS '+label+': animation, JavaScript/CSS, photo, resume, favicon, presence endpoint, project dialog, and canonical/OG URL.');
  }finally{await context.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
 }
}finally{
 await browser.close();
 if(previousBase===undefined)delete process.env.VITE_BASE_PATH;else process.env.VITE_BASE_PATH=previousBase;
 if(previousUrl===undefined)delete process.env.VITE_SITE_URL;else process.env.VITE_SITE_URL=previousUrl;
}
