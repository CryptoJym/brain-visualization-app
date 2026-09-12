from pathlib import Path
import xml.etree.ElementTree as ET
import json
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ns = '{http://www.w3.org/2000/svg}'
root = Path(__file__).resolve().parents[1] / 'public/brand'
marksvg = (root / 'approved-mark-source.txt').read_text()
word = (root / 'approved-wordmark-source.txt').read_text()
svg = ET.fromstring(marksvg)
defs = ET.tostring(svg.find(ns + 'defs'), encoding='unicode')
mark = ET.tostring(svg.find(ns + 'g'), encoding='unicode')
master = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1370 270">{defs}<g transform="translate(0 4) scale(.437)">{mark}</g>{word}</svg>'
(root / 'logo-lockup-light.svg').write_text(master)
(root / 'logo-mark-light.svg').write_text(marksvg)
colors = {'#092b4a':'#edfaff','#123c58':'#b8e8ef','#087e97':'#6de1df','#029aaa':'#4fdee1','#0bbfc0':'#a7f5e5','#468798':'#80cfd7'}
for filename, text in [('logo-lockup-dark.svg', master), ('logo-mark-dark.svg', marksvg)]:
    for old, new in colors.items():
        text = text.replace(old, new)
    (root / filename).write_text(text)
(root.parent / 'favicon.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" rx="96" fill="#f7fbfd"/>{defs}<g transform="translate(18 18) scale(.94)">{mark}</g></svg>')
(root / 'icon-maskable.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f7fbfd"/>{defs}<g transform="translate(84 84) scale(.72)">{mark}</g></svg>')
(root / 'provenance.json').write_text(json.dumps({'approvedSource':'cortex_compass_neuroscience_logo.png','sourceSha256':'b70cd1736c5ddb91e6218b263ad2a32b65e66eb1b1085e255de9d856f0c5f2fd','method':'Contour extraction of the approved emblem and wordmark; small-size simplification and dark-background contrast variant.','version':'cc-brand-20260912'}, indent=2))
print('Prepared valid SVG logo variants and icon masters.')
