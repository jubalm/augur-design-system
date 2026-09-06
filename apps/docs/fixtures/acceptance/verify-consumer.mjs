/** Run against the disposable registry consumer after prepare-consumer.mjs.
 * bun apps/docs/fixtures/acceptance/verify-consumer.mjs http://127.0.0.1:4340 [outDir]
 */
import { chromium } from 'playwright';
import { mkdir,writeFile } from 'node:fs/promises';
import {join} from 'node:path';
const origin=process.argv[2], out=process.argv[3] || '/tmp/augur-consumer-review';
if(!origin) throw new Error('Pass the disposable consumer origin');
await mkdir(out,{recursive:true});
const browser=await chromium.launch();
const results=[];
for(const theme of ['light','dark']) for(const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844}]) {
 const page=await browser.newPage({viewport});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('requestfailed',r=>errors.push(r.url()));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
 await page.goto(origin,{waitUntil:'networkidle'});
 await page.evaluate(t=>{document.documentElement.dataset.theme=t},theme);
 await page.evaluate(()=>document.fonts.ready);
 const evidence=await page.evaluate(()=>({
  body:getComputedStyle(document.body).fontFamily,
  heading:getComputedStyle(document.querySelector('h1')).fontSize,
  padding:getComputedStyle(document.querySelector('.aug-card-header')).paddingTop,
  space:getComputedStyle(document.documentElement).getPropertyValue('--augur-spacing-xl').trim(),
  roles:[...document.querySelectorAll('.example-record-panel')].map(el=>({theme:el.dataset.theme,bg:getComputedStyle(el).backgroundColor,fg:getComputedStyle(el).color,padding:getComputedStyle(el).paddingTop,question:getComputedStyle(el.querySelector('.example-record-question')).fontSize,weight:getComputedStyle(el.querySelector('.example-record-question')).fontWeight})),
  sora:document.fonts.check('600 28px Sora'),schibsted:document.fonts.check('16px "Schibsted Grotesk"'),
  loaded:[...document.fonts].filter(f=>f.status==='loaded').map(f=>`${f.family} ${f.weight}`),
  overflow:document.documentElement.scrollWidth>innerWidth,
  docsCss:[...document.styleSheets].some(s=>s.href?.includes('docs')),
 }));
 const pass=evidence.body.includes('Schibsted') && evidence.heading===(viewport.width<600?'32px':'40px') && evidence.space==='24px' && evidence.padding===(viewport.width<600?'16px':'24px') && evidence.roles[0].bg==='rgb(255, 255, 255)' && evidence.roles[1].bg==='rgb(29, 29, 48)' && evidence.roles.every(r=>r.question==='20px' && r.weight==='600') && !evidence.overflow && !evidence.docsCss && evidence.sora && evidence.schibsted && !errors.length;
 results.push({theme,viewport,evidence,errors,pass});
 await page.screenshot({path:join(out,`consumer-${theme}-${viewport.width}.png`),fullPage:true});
 await page.close();
}
await writeFile(join(out,'consumer-verification.json'),JSON.stringify(results,null,2));
await browser.close();
console.log(`${results.filter(r=>r.pass).length}/${results.length} consumer combinations passed`);
if(results.some(r=>!r.pass)) process.exit(1);
