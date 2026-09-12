"""Verify browser-produced fictional reports and render every page for inspection."""
from pathlib import Path
import json, os, subprocess, xml.etree.ElementTree as ET
from pypdf import PdfReader
ROOT=Path(os.environ.get('CORTEX_PDF_ROOT','.local-evidence/reports-v6/worker-browser'))
OUT=Path('.local-evidence/reports-v6/render-final')
OUT.mkdir(parents=True,exist_ok=True)
receipts=[]
for kind in ['Superhero','Scientific']:
 for paper in ['A4','Letter']:
  path=ROOT/f'Cortex-Compass-{kind}-{paper}.pdf'
  reader=PdfReader(path)
  counts=[len(p.extract_text() or '') for p in reader.pages]
  assert all(n>300 for n in counts),(path.name,'empty/stranded page',counts)
  if kind=='Superhero':assert len(reader.pages)==2,(path.name,len(reader.pages))
  text=' '.join(p.extract_text() or '' for p in reader.pages)
  assert f'{kind}' in text and 'FICTIONAL' in text
  if kind=='Scientific':
   for term in ['Correlation is not causation','10.1017/S003329171900134X','10.1038/s41586-022-04492-9','Hippocampus','Ventral striatum','Unknown here:']:
    assert ''.join(term.split()) in ''.join(text.split()),(path.name,term)
  links=sum(len(p.get('/Annots',[])) for p in reader.pages)
  bbox=OUT/f'{kind}-{paper}.html'
  subprocess.run(['pdftotext','-bbox',str(path),str(bbox)],check=True,capture_output=True)
  tree=ET.parse(bbox);bad=[]
  for i,page in enumerate(tree.findall('.//{*}page')):
   w,h=float(page.attrib['width']),float(page.attrib['height'])
   for word in page.findall('.//{*}word'):
    x0,y0,x1,y1=[float(word.attrib[k]) for k in ['xMin','yMin','xMax','yMax']]
    if x0<10 or y0<10 or x1>w-10 or y1>h-10:bad.append((i+1,word.text,[x0,y0,x1,y1]))
  assert not bad,(path.name,'out-of-bounds text',bad[:10])
  receipts.append({'file':path.name,'pages':len(reader.pages),'bytes':path.stat().st_size,'minimumPageTextLength':min(counts),'linkAnnotations':links,'textBoundsPass':True})
  if paper=='A4':
   for stale in OUT.glob(f'{kind}-[0-9]*.png'):stale.unlink()
   subprocess.run(['pdftoppm','-scale-to','1100','-png',str(path),str(OUT/kind)],check=True,capture_output=True)
(OUT/'audit.json').write_text(json.dumps(receipts,indent=2))
print(json.dumps(receipts,indent=2))
