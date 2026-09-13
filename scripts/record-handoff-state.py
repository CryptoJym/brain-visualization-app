"""Read-only repository/provider inventory and an allowlisted local residue snapshot."""
from pathlib import Path
from datetime import datetime,timezone
import subprocess,json,hashlib,os,shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/handoff-20260913'
EVIDENCE=ROOT/'.local-evidence/handoff-20260913';EVIDENCE.mkdir(exist_ok=True)
BUNDLE=Path('/Users/utlyze/Projects/cortex-compass-handoff-20260913');BUNDLE.mkdir(exist_ok=True)
def git(path,*args):return subprocess.check_output(['git','-C',str(path),*args],text=True).strip()
worktrees=[]
for paragraph in git(ROOT,'worktree','list','--porcelain').split('\n\n'):
 row=dict(line.split(' ',1) for line in paragraph.splitlines() if ' ' in line)
 path=Path(row['worktree']);status=git(path,'status','--short')
 worktrees.append({'path':str(path),'head':row['HEAD'],'branch':row.get('branch','').replace('refs/heads/',''),'statusAtInspection':status.splitlines()})
allowed=('src/','docs/','scripts/','tests/','public/')
residue=[]
for row in worktrees:
 path=Path(row['path']);target=BUNDLE/'preserved-residue'/path.name
 untracked=git(path,'ls-files','--others','--exclude-standard').splitlines()
 for name in untracked:
  if not name.startswith(allowed) or '/handoff-20260913/' in name:continue
  source=path/name
  if not source.is_file() or source.is_symlink() or source.suffix.lower() in {'.env','.pem','.key','.woff','.woff2','.ttf','.otf'}:continue
  if source.stat().st_size>10000000:continue
  dest=target/name;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest)
  residue.append({'source':str(source),'snapshot':str(dest.relative_to(BUNDLE)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
 if path!=ROOT:
  diff=subprocess.check_output(['git','-C',str(path),'diff','HEAD','--','src','docs','tests','scripts','README.md'])
  if diff:target.mkdir(parents=True,exist_ok=True);(target/'working-tree.patch').write_bytes(diff)
env=dict(os.environ,CLOUDFLARE_AUTH_USE_KEYRING='true',WRANGLER_SEND_METRICS='false')
raw=subprocess.check_output(['/Users/utlyze/Projects/freely-sweet/node_modules/.bin/wrangler','deployments','list','--config',str(ROOT/'wrangler.jsonc'),'--json'],env=env,text=True)
native=json.loads(raw)[-1]
assert native['versions']==[{'version_id':'e127727f-f809-4b6f-85ca-fa7e7f67b75d','percentage':100}], 'Production changed: review handoff before sealing.'
state={'schema':'cortex-agent-handoff/v1','observedAt':datetime.now(timezone.utc).isoformat(),'device':'Studio0.localdomain','currentSourceWorktree':str(ROOT),'liveSourceCommit':'85a29955e7b206a2cd8581289c321f72e1f21243','liveReceiptCommit':'157971e','production':{'origin':'https://cortexcompass.utlyze.com','version':native['versions'][0]['version_id'],'trafficPercent':100,'deployedAt':native['created_on'],'rollbackVersion':'6fc5170e-fbea-44f1-bfaf-07e0b6d7fec0'},'graph':{'worktree':'/Users/utlyze/Projects/cortex-compass-neurograph-v1','branch':'astra/cortex-neurograph-v1','checkpoint':git(Path('/Users/utlyze/Projects/cortex-compass-neurograph-v1'),'rev-parse','HEAD'),'prototypeTestsPassed':9,'integrated':False,'calibrated':False},'worktrees':worktrees,'residualFilesPreserved':residue,'sourceOnlyPreservation':True,'secretsExported':False,'productionChangedByHandoff':False,'localTransferDirectory':str(BUNDLE)}
(OUT/'handoff-state.json').write_text(json.dumps(state,indent=2)+'\n')
(EVIDENCE/'native-production.json').write_text(json.dumps({'observedAt':state['observedAt'],'version':native['versions'],'deployedAt':native['created_on']},indent=2)+'\n')
print(json.dumps({'worktrees':len(worktrees),'residualFilesPreserved':len(residue),'graphCheckpoint':state['graph']['checkpoint'],'productionVersion':state['production']['version'],'localTransferDirectory':str(BUNDLE)},indent=2))
