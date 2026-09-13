from pathlib import Path
from pypdf import PdfReader
import subprocess,json,xml.etree.ElementTree as ET
root=Path('.local-evidence/neurohero-v9/browser');out=root/'render';out.mkdir(exist_ok=True)
rows=[]
for path in root.glob('*.pdf'):
 reader=PdfReader(path);counts=[len(p.extract_text() or '') for p in reader.pages]
 assert all(n>300 for n in counts),(path.name,counts)
 if 'Field-Guide-' in path.name or path.name=='Device-Portrait-Print-Fixture.pdf':assert len(reader.pages)==2
 if 'Strengths-Card' in path.name:assert len(reader.pages)==1
 bbox=out/(path.stem+'.html');subprocess.run(['pdftotext','-bbox',str(path),str(bbox)],check=True,capture_output=True)
 bad=[]
 for i,page in enumerate(ET.parse(bbox).findall('.//{*}page')):
  w,h=float(page.attrib['width']),float(page.attrib['height'])
  for word in page.findall('.//{*}word'):
   x0,y0,x1,y1=[float(word.attrib[k]) for k in ['xMin','yMin','xMax','yMax']]
   if x0<10 or y0<10 or x1>w-10 or y1>h-10:bad.append((i+1,word.text))
 assert not bad,(path.name,bad[:8])
 rows.append({'file':path.name,'pages':len(reader.pages),'bytes':path.stat().st_size,'minimumPageText':min(counts),'textBoundsPass':True})
 if path.name in ['Neurohero-Field-Guide-A4.pdf','Neurohero-Strengths-Card.pdf','Neurohero-Scientific-A4.pdf']:
  subprocess.run(['pdftoppm','-scale-to','1100','-png',str(path),str(out/path.stem)],check=True,capture_output=True)
(out/'audit.json').write_text(json.dumps(rows,indent=2));print(json.dumps(rows,indent=2))
