/** Non-shipping visual contract build, capture and checks. Run from repository root. */
import { chromium } from 'playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = dirname(fileURLToPath(import.meta.url));
const repo = resolve(root, '../../../..');
const generated = resolve(root, '.generated');
const evidence = resolve(root, 'evidence');
await mkdir(generated, {recursive:true});
await mkdir(evidence, {recursive:true});
const build = await Bun.build({entrypoints:[resolve(root,'reference.css')],outdir:generated,target:'browser'});
assert.ok(build.success, JSON.stringify(build.logs));
await writeFile(resolve(generated,'index.html'),await readFile(resolve(root,'index.html')));
const server = Bun.serve({hostname:'127.0.0.1',port:0,async fetch(request) {
 const path = decodeURIComponent(new URL(request.url).pathname);
 const file = resolve(generated, '.' + (path === '/' ? '/index.html' : path));
 if (!file.startsWith(generated + '/')) return new Response('Not found',{status:404});
 const asset = Bun.file(file);return await asset.exists() ? new Response(asset) : new Response('Not found',{status:404});
}});
const url = `http://127.0.0.1:${server.port}`;
if (process.argv.includes('--serve')) { console.log(`Reference fixture: ${url}`); await new Promise(()=>{}); }
const browser = await chromium.launch({headless:true});
const report = {sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(), sourcePdfSha256:createHash('sha256').update(await readFile(resolve(repo,'resources/brand/augur-brand-foundation.pdf'))).digest('hex'), fixtureSha256:{}, captures:[], contrast:{}, limitations:['Final human visual acceptance remains pending issue 53.','These local reference compositions do not migrate runtime tokens or constitute a product workflow.']};
for (const file of ['index.html','reference.css','review.mjs']) report.fixtureSha256[file]=createHash('sha256').update(await readFile(resolve(root,file))).digest('hex');
function contrast(a,b) { function luminance(s) {const rgb=s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>v/255).map(v=>v<=0.04045?v/12.92:((v+0.055)/1.055)**2.4);return rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;} const x=luminance(a),y=luminance(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
try {
for (const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844}]) {
 let firstGeometry;
 for (const theme of ['light','dark']) {
 const context=await browser.newContext({viewport,hasTouch:viewport.width===390,isMobile:viewport.width===390,deviceScaleFactor:1,reducedMotion:'reduce'});
 const page=await context.newPage(); const errors=[]; const fontResponses=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(['error','warning'].includes(m.type()))errors.push(m.text());});
 page.on('requestfailed',r=>errors.push(`request failed ${r.url()}`));
 page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);if(/woff/.test(r.url()))fontResponses.push({url:r.url(),status:r.status()});});
 await page.goto(`${url}/?theme=${theme}`,{waitUntil:'networkidle'});
 await page.evaluate(async()=>{await document.fonts.ready; await Promise.all([document.fonts.load('400 40px Sora'),document.fonts.load('600 40px Sora'),document.fonts.load('400 16px "Schibsted Grotesk"')]);});
 const actual=await page.evaluate(()=>{
 const style=(selector)=>{const node=document.querySelector(selector),s=getComputedStyle(node),r=node.getBoundingClientRect();return {family:s.fontFamily,weight:s.fontWeight,size:s.fontSize,line:s.lineHeight,tracking:s.letterSpacing,color:s.color,background:s.backgroundColor,border:s.borderColor,radius:s.borderRadius,width:r.width,height:r.height};};
 return {fonts:{sora400:document.fonts.check('400 40px Sora'),sora600:document.fonts.check('600 40px Sora'),schibsted400:document.fonts.check('400 16px "Schibsted Grotesk"')},faces:[...document.fonts].filter(f=>f.status==='loaded').map(f=>({family:f.family,weight:f.weight,status:f.status})),styles:{title:style('h1'),display:style('.augur-display'),body:style('body'),metadata:style('.meta'),control:style('[data-choice]'),record:style('.record'),field:style('.record-field'),signal:style('.opening .signal'),recordSignal:style('.record .signal')},geometry:[...document.querySelectorAll('main section,.record,.choices,h1,.editorial-grid,.record-grid')].map(n=>{const r=n.getBoundingClientRect();return {tag:n.id||n.className,x:r.x,y:r.y,width:r.width,height:r.height};}),overflow:document.documentElement.scrollWidth>innerWidth,coarse:matchMedia('(pointer:coarse)').matches,cssFonts:[...document.styleSheets].flatMap(sheet=>{try{return [...sheet.cssRules].filter(r=>r.type===CSSRule.FONT_FACE_RULE).map(r=>({family:r.style.fontFamily,weight:r.style.fontWeight,source:r.style.src.slice(0,80),sourceCharacters:r.style.src.length}));}catch{return [];}})};});
 assert.ok(Object.values(actual.fonts).every(Boolean),'font loading');assert.equal(actual.overflow,false,'horizontal overflow');assert.equal(actual.styles.title.weight,'400');assert.equal(actual.styles.display.weight,'600');assert.equal(actual.styles.control.radius,'0px'); for(const signal of [actual.styles.signal,actual.styles.recordSignal]) {assert.equal(signal.width,32);assert.equal(signal.height,2);}
 if(viewport.width===390) {assert.ok(actual.coarse);assert.ok(actual.styles.control.height>=44);}
 if(firstGeometry)assert.deepEqual(actual.geometry,firstGeometry,'light/dark geometry parity');else firstGeometry=actual.geometry;
 const edgePairs=[actual.styles.control.background,actual.styles.record.background,actual.styles.body.background].map(bg=>contrast(actual.styles.control.border,bg));
 assert.ok(edgePairs.every(r=>r>=3),`control edge contrast ${edgePairs}`);
 const textContrast=contrast(actual.styles.control.color,actual.styles.control.background); assert.ok(textContrast>=4.5);
 const bodyContrast=contrast(actual.styles.body.color,actual.styles.body.background); assert.ok(bodyContrast>=4.5);
 const signalContrast=contrast(actual.styles.signal.background,actual.styles.body.background);assert.ok(signalContrast>=3);
 report.contrast[theme]={controlEdgeAgainstControlPanelCanvas:edgePairs.map(n=>+n.toFixed(2)),controlLabel:+textContrast.toFixed(2),body:+bodyContrast.toFixed(2),signal:+signalContrast.toFixed(2),editorialRules:'Grouping only; headings, spacing, and tonal fields preserve structure.'};
 const filename=`${theme}-${viewport.width}x${viewport.height}.png`;
 await page.screenshot({path:resolve(evidence,filename),fullPage:true});
 await page.keyboard.press('Tab'); assert.equal(await page.locator('#theme').evaluate(n=>document.activeElement===n),true); await page.keyboard.press('Tab'); assert.equal(await page.locator('.text-action').evaluate(n=>document.activeElement===n),true);await page.keyboard.press('Tab');
 assert.equal(await page.locator('[data-choice="Yes"]').evaluate(n=>document.activeElement===n),true);
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-choice=Yes]')).outlineWidth==='2px',{},{timeout:3000});
 const focus=await page.locator('[data-choice="Yes"]').evaluate(n=>{const s=getComputedStyle(n);return {visible:n.matches(':focus-visible'),width:s.outlineWidth,offset:s.outlineOffset,color:s.outlineColor};});assert.ok(focus.visible);assert.equal(focus.width,'2px');assert.equal(focus.offset,'2px');
 await page.keyboard.press('Space');assert.equal(await page.locator('#response').textContent(),'Yes · preview only');assert.equal(await page.locator('[data-choice="Yes"]').getAttribute('aria-pressed'),'true');
 if(viewport.width===1440)await page.locator('.record-field').screenshot({path:resolve(evidence,`${theme}-focus.png`)});
 assert.deepEqual(errors,[],'browser console/network');
 report.captures.push({file:filename,route:`/?theme=${theme}`,viewport,theme,actual,focus,fontResponses,errors,keyboard:'Theme, text link, Yes choice tab order; Space selects local preview with explicit response label.'});
 await context.close();
 }
}
await writeFile(resolve(evidence,'verification.json'),JSON.stringify(report,null,2)+'\n');
console.log('Visual reference verification passed: 6 captures, theme geometry parity, fonts, contrast, keyboard, coarse-pointer sizing, no overflow or console/network failures.');
} finally {await browser.close();server.stop();}
