"""Preserve reviewed Cortex source, draft graph, docs and fictional assets locally. No cloud writes."""
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,shutil,zipfile,re,os
ROOT=Path(__file__).resolve().parents[1]
GRAPH=Path('/Users/utlyze/Projects/cortex-compass-neurograph-v1')
OUT=Path('/Users/utlyze/Projects/cortex-compass-handoff-20260913')
DOCS=ROOT/'docs/handoff-20260913'
ARCHIVE=OUT.parent/'Cortex-Compass-Handoff-20260913.zip'
def git(root,*args):return subprocess.check_output(['git','-C',str(root),*args],text=True).strip()
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
excluded=[]
def allowed(path):
 name=path.name.lower()
 return not (name.startswith('.env') or name.startswith('.dev.vars') or path.suffix.lower() in {'.pem','.key','.p12','.woff','.woff2','.ttf','.otf'} or any(x in path.parts for x in ['node_modules','.git','.wrangler']))
def copy(source,dest):
 if source.is_symlink() or not allowed(source):excluded.append(str(source));return
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
def tracked(root,*prefixes):
 return [p for p in subprocess.check_output(['git','-C',str(root),'ls-files','-z','--',*prefixes]).decode().split('\0') if p]
assert not git(ROOT,'diff','HEAD','--','src','worker','public','wrangler.jsonc'),'Runtime source changed during handoff.'
assert not git(GRAPH,'status','--porcelain'),'Graph worktree changed; reconcile before snapshot.'
board=json.loads((DOCS/'workboard.json').read_text());sync=json.loads((DOCS/'beads-sync.json').read_text())
assert sync['status']=='verified' and sync['taskCount']==9 and sync['blockingEdgeCount']==10
OUT.mkdir(exist_ok=True)
for name in tracked(ROOT):copy(ROOT/name,OUT/'source-current'/name)
for source in DOCS.rglob('*'):
 if source.is_file():copy(source,OUT/'docs'/source.relative_to(DOCS))
for name in tracked(GRAPH,'src/data/neurograph','src/utils/neurograph','tests/neurograph-v1.test.mjs','docs/neurograph-v1'):
 copy(GRAPH/name,OUT/'graph-prototype'/name)
patch=subprocess.check_output(['git','-C',str(GRAPH),'format-patch','-1','aae0e60','--stdout'])
(OUT/'graph-checkpoint-aae0e60.patch').write_bytes(patch)
base=ROOT/'.local-evidence/hero-editions'
for folder in ['final-checks','live-final-checks','live-hero-retry']:
 for source in (base/folder).rglob('verification.json'):copy(source,OUT/'verification'/'hero-editions'/source.relative_to(base))
 receipt=base/folder/'receipt.json'
 if receipt.exists():copy(receipt,OUT/'verification'/'hero-editions'/receipt.relative_to(base))
for name in ['unit-final.log','final-render/audit.json','final-release-manifest.json']:
 source=base/name
 if source.exists():copy(source,OUT/'verification'/'hero-editions'/name)
copy(GRAPH/'.local-evidence/handoff-20260913/graph-tests.log',OUT/'verification'/'graph-tests.log')
source_head=git(ROOT,'rev-parse','HEAD');graph_head=git(GRAPH,'rev-parse','HEAD')
metadata={'createdAt':datetime.now(timezone.utc).isoformat(),'sourceCheckpoint':source_head,'deployedSource':'85a29955e7b206a2cd8581289c321f72e1f21243','graphCheckpoint':graph_head,'productionVersion':'e127727f-f809-4b6f-85ca-fa7e7f67b75d','nativeTasks':sync['ids'],'nativeBlockingEdges':sync['blockingEdgeCount'],'excludedFiles':excluded,'productionModified':False,'paidProviderRequests':0,'sourceSnapshotIsNotGitRepository':True}
(OUT/'PACKAGE-STATE.json').write_text(json.dumps(metadata,indent=2)+'\n')
readme='''# Cortex Compass: start here

This is the local transfer package, not a production deployment.

Read `docs/README.md`, then `docs/04-NEXT-AGENT.md` and `docs/05-BEADS.md`.

- `source-current/`: current application source, public artwork, Blender/3D files, report samples and tests.
- `graph-prototype/`: preserved unfinished graph modules; not imported by production.
- `graph-checkpoint-aae0e60.patch`: exact graph commit for controlled import into a successor branch.
- `docs/`: full architecture, decisions, file contracts, mathematical caveats, workboard and native task IDs.
- `verification/`: prior software/PDF receipts, including the failed live attempt and successful retry.
- `preserved-residue/`: uncommitted source and patch snapshots from older worktrees. Historical recovery material, not code to apply indiscriminately.
- `MANIFEST.json` and `SHA256SUMS.txt`: file identity; `verify-package.py` checks every recorded file.

Authoritative live working copy: `/Users/utlyze/Projects/cortex-compass-hero-editions-20260913`.
Unfinished graph working copy: `/Users/utlyze/Projects/cortex-compass-neurograph-v1`.
GitHub repository: `CryptoJym/brain-visualization-app`. Branches and commits are in `PACKAGE-STATE.json`.

Do not deploy the old graph base over the current product. Start a new branch from the verified live source and import the graph checkpoint only. Then complete NG01–NG07 in the registered native Beads board. This package is a plain source snapshot, not a .git repository. Original repositories/worktrees remain intact.

No browser profiles, environment values, authentication files, private cloud objects, node_modules or font binaries are bundled. Credentials remain in the existing vault/runtime. Public fictional artwork and native PDF samples are in `source-current/public`. Review the handoff for exact validation limits. The current live app is unchanged by packaging.
'''
(OUT/'README.md').write_text(readme)
verifier='''from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parent
manifest=json.loads((root/'MANIFEST.json').read_text())
for row in manifest['files']:
 p=root/row['path']
 assert p.is_file() and not p.is_symlink(),row['path']
 assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
print('Verified',len(manifest['files']),'files against the local package manifest.')
'''
(OUT/'verify-package.py').write_text(verifier)
indicators=re.compile(rb'(?:sk-[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
entries=[]
for p in sorted(OUT.rglob('*')):
 if not p.is_file() or p.name in ['MANIFEST.json','SHA256SUMS.txt']:continue
 assert not p.is_symlink() and allowed(p),str(p)
 if p.suffix in {'.py','.mjs','.js','.jsx','.md','.json','.patch','.txt','.yaml','.yml'} and p.stat().st_size<2000000:
  assert not indicators.search(p.read_bytes()),'Review possible credential in '+str(p.relative_to(OUT))
 entries.append({'path':str(p.relative_to(OUT)),'bytes':p.stat().st_size,'sha256':sha(p)})
manifest={'schema':'cortex-transfer-manifest/v1','createdAt':datetime.now(timezone.utc).isoformat(),'files':entries,'sourceCheckpoint':source_head,'graphCheckpoint':graph_head,'bytes':sum(e['bytes'] for e in entries)}
(OUT/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
(OUT/'SHA256SUMS.txt').write_text(''.join(e['sha256']+'  '+e['path']+'\n' for e in entries))
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(OUT.rglob('*')):
  if p.is_file():z.write(p,OUT.name+'/'+str(p.relative_to(OUT)))
with zipfile.ZipFile(ARCHIVE) as z:assert z.testzip() is None
subprocess.run(['python3',str(OUT/'verify-package.py')],check=True)
result={'directory':str(OUT),'archive':str(ARCHIVE),'files':len(entries),'uncompressedBytes':manifest['bytes'],'archiveBytes':ARCHIVE.stat().st_size,'archiveSha256':sha(ARCHIVE),'sourceCheckpoint':source_head,'graphCheckpoint':graph_head,'nativeTasks':9,'blockingEdges':10,'verified':True}
(ROOT/'.local-evidence/handoff-20260913/package-receipt.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
