import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createPortfolioServer} from '../server/index.mjs';
const server=await createPortfolioServer({port:0});
const base='http://127.0.0.1:'+server.port;
const browser=await chromium.launch({channel:'chrome'});
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base,{waitUntil:'domcontentloaded'});
 await expect(page.getByTestId('build-sequence')).toBeVisible();
 await expect(page.locator('.build-demo-cursor')).toHaveCount(3);
 await expect(page.locator('h1')).toHaveAttribute('data-build-state','waiting');
 const start=await page.locator('.build-demo-cursor').first().getAttribute('style');
 await expect.poll(()=>page.locator('.build-demo-cursor').first().getAttribute('style'),{timeout:4000}).not.toBe(start);
 const total=Number(await page.getByTestId('build-sequence').getAttribute('data-duration'));
 await expect.poll(()=>page.evaluate(()=>window.scrollY),{timeout:15000}).toBeGreaterThan(100);
 await expect(page.getByTestId('build-sequence')).toHaveAttribute('data-stage','Bringing projects to life',{timeout:15000});
 await mkdir(new URL('../qa',import.meta.url),{recursive:true});
 await page.screenshot({path:fileURLToPath(new URL('../qa/build-projects.png',import.meta.url))});
 await expect(page.getByTestId('build-sequence')).toHaveCount(0,{timeout:total+10000});
 await expect(page.locator('footer')).toBeInViewport();
 assert.ok(await page.evaluate(()=>window.scrollY>1000),'Full intro ends at the footer');
 await expect(page.locator('[data-build-state]')).toHaveCount(0);
 await expect(page.locator('.presence-trigger')).toBeVisible();
 await expect(page.locator('.presence-trigger')).toContainText('1 online');
 await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2000))]));
 await page.getByRole('button',{name:'Replay Build',exact:true}).click();
 await expect(page.getByTestId('build-sequence')).toBeVisible();
 await page.waitForTimeout(1700);
 await mkdir(new URL('../qa',import.meta.url),{recursive:true});
 await page.screenshot({path:fileURLToPath(new URL('../qa/build-intro-desktop.png',import.meta.url))});
 await page.getByRole('button',{name:'Skip build intro'}).click();
 await expect(page.locator('[data-build-state]')).toHaveCount(0);
 await expect(page.locator('html')).not.toHaveAttribute('data-build-active','true');
 // Replay from a scrolled position must remain active after returning to the top.
 await page.evaluate(()=>window.scrollTo(0,1600));
 await page.getByRole('button',{name:'Replay Build',exact:true}).click();
 await page.waitForTimeout(300);
 await expect(page.getByTestId('build-sequence')).toBeVisible();
 assert.equal(await page.evaluate(()=>window.scrollY),0);
 await page.keyboard.press('Escape');
 await expect(page.getByTestId('build-sequence')).toHaveCount(0);
 await page.getByRole('button',{name:'Replay Build',exact:true}).click();
 await page.keyboard.press('Tab');
 await expect(page.locator('[data-build-state]')).toHaveCount(0);
 await page.getByRole('button',{name:'Replay Build',exact:true}).click();
 await page.getByRole('button',{name:/Motion/}).click();
 await expect(page.getByTestId('build-sequence')).toHaveCount(0);
 await expect(page.locator('html')).toHaveAttribute('data-motion','off');
 // Explicit replay enables motion and starts a new run.
 for(const width of [768,390,320]){
  await page.setViewportSize({width,height:900});
  await page.getByRole('button',{name:'Replay Build',exact:true}).click();
  await expect(page.getByTestId('build-sequence')).toBeVisible();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow during intro at '+width);
  if(width===390){await page.waitForTimeout(1400);await page.screenshot({path:fileURLToPath(new URL('../qa/build-intro-mobile.png',import.meta.url))})}
  await page.getByRole('button',{name:'Skip build intro'}).click();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No overflow after intro at '+width);
 }
 await page.getByRole('button',{name:'Replay Build',exact:true}).click();
 await page.mouse.wheel(0,300);
 await expect(page.getByTestId('build-sequence')).toHaveCount(0);
 await expect(page.locator('[data-build-state]')).toHaveCount(0);
 const reduced=await browser.newContext({reducedMotion:'reduce'});
 const rp=await reduced.newPage();await rp.goto(base,{waitUntil:'domcontentloaded'});
 await expect(rp.locator('h1')).toBeVisible();
 await expect(rp.getByTestId('build-sequence')).toHaveCount(0);
 await expect(rp.getByRole('button',{name:'Replay Build',exact:true})).toBeDisabled();
 await reduced.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: automatic full-page intro, moving demo cursors, automatic scroll through projects, completion at footer, actual content reveals, replay from scroll, Skip/Escape/Tab, motion off/on, reduced motion, mobile widths, scroll cancellation, and unchanged real visitor count.');
}finally{await browser.close();await server.close()}
