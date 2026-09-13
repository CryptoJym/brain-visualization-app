from pathlib import Path
import json,subprocess,xml.etree.ElementTree as ET
from pypdf import PdfReader
root=Path('.local-evidence/xai-portraits/final-samples');out=root/'render';out.mkdir(exist_ok=True)
receipts=[]
for file in sorted(root.glob('*.pdf')):
 reader=PdfReader(file);expected=1 if 'Strengths' in file.name else 2
 assert len(reader.pages)==expected,(file.name,len(reader.pages))
 text=' '.join(p.extract_text() or '' for p in reader.pages)
 assert 'FICTIONAL SAMPLE' in text and 'Signal Cartographer' in text
 assert 'Loading saved artwork' not in text
 objects=reader.pages[0]['/Resources'].get('/XObject',{}).get_object();images=[obj.get_object() for obj in objects.values() if obj.get_object().get('/Subtype')=='/Image' and obj.get_object().get('/Width',0)>=500 and obj.get_object().get('/Height',0)>=500]
 assert images,(file.name,'missing hero portrait')
 bbox=out/(file.stem+'.html');subprocess.run(['pdftotext','-bbox',str(file),str(bbox)],check=True,capture_output=True)
 bad=[]
 for i,page in enumerate(ET.parse(bbox).findall('.//{*}page')):
  w,h=float(page.attrib['width']),float(page.attrib['height'])
  for word in page.findall('.//{*}word'):
   x0,y0,x1,y1=[float(word.attrib[k]) for k in ['xMin','yMin','xMax','yMax']]
   if x0<8 or y0<8 or x1>w-8 or y1>h-8:bad.append((i+1,word.text))
 assert not bad,(file.name,bad)
 subprocess.run(['pdftoppm','-scale-to','1100','-png',str(file),str(out/file.stem)],check=True,capture_output=True)
 receipts.append({'file':file.name,'pages':len(reader.pages),'bytes':file.stat().st_size,'portraitEmbedded':True,'fictionalLabel':True,'textBoundsPass':True})
(root/'audit.json').write_text(json.dumps(receipts,indent=2));print(json.dumps(receipts,indent=2))
