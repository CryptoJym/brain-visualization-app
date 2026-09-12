// Explicit print-media settling avoids stale screen styles across sequential paper-size exports.
export async function exportReportPDF(page,path,format){
 try{
  await page.emulateMediaType('print');
  await page.waitForFunction(()=>matchMedia('print').matches);
  await page.evaluate(async()=>{
   await document.fonts.ready;
   await Promise.all([...document.querySelectorAll('.cc-report-document img')].map(img=>img.decode().catch(()=>{})));
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
  await page.pdf({path,format,printBackground:true,preferCSSPageSize:false,timeout:60000});
 }finally{await page.emulateMediaType('screen');}
}
