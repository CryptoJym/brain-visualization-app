"""Validate native Beads readback and update the portable board; no tracker writes."""
from pathlib import Path
from datetime import datetime,timezone
import json
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/handoff-20260913';EVIDENCE=ROOT/'.local-evidence/handoff-20260913'
IDS={'NG01':'eco-eib7d3','NG02':'eco-yn5ip8','NG03':'eco-hb5qwn','NG04':'eco-g272fw','NG05':'eco-r3nv7o','NG06':'eco-kkn8hg','NG07':'eco-dfbod1','OP01':'eco-763a8h','OP02':'eco-bzuidj'}
board=json.loads((OUT/'workboard.json').read_text());native=json.loads((EVIDENCE/'beads-native-readback.json').read_text());by_id={x['id']:x for x in native};edges=[]
for task in board['tasks']:
 id=IDS[task['alias']];row=by_id[id];assert row['title']==task['title'];assert row.get('acceptance_criteria'),id
 actual={d['id'] for d in row.get('dependencies',[]) if d.get('dependency_type')=='blocks'}
 expected={IDS[a] for a in task['dependsOn']};assert actual==expected,(id,actual,expected)
 parent='eco-cq76kh' if task['alias'].startswith('NG') else 'eco-a318wk';assert row.get('parent')==parent,(id,row.get('parent'))
 task.update(canonicalId=id,nativeStatus=row['status'],nativeSynchronized=True,parent=parent,nativeAcceptance=row['acceptance_criteria'])
 if 'requestedId' in task:task['supersededRequestedId']=task.pop('requestedId')
 for dep in sorted(actual):edges.append({'from':id,'dependsOn':dep,'type':'blocks'})
 text='# '+task['alias']+' — '+task['title']+'\n\nNative ID: `'+id+'`. Status: '+row['status']+'. Parent: `'+parent+'`.\n\nRole: '+task['ownerRole']+'. Depends on: '+(', '.join(IDS[a] for a in task['dependsOn']) or 'none')+'.\n\nScope: '+', '.join(task['scope'])+'.\n\n'+task['description']+'\n\n## Acceptance\n'+'\n'.join('- '+a for a in task['acceptance'])+'\n\nNative acceptance readback: '+row['acceptance_criteria']+'\n'
 (OUT/'tasks'/(task['alias']+'.md')).write_text(text)
parents=json.loads((EVIDENCE/'parent-native-readback.json').read_text());parent_map={x['id']:x for x in parents}
for old in board['historicalItems']:
 if old['id'] in parent_map:old.update(nativeStatus=parent_map[old['id']]['status'],statusVerified=True)
board.update(nativeSyncStatus='verified-native-tasks-acceptance-and-dependencies',nativeVerifiedAt=datetime.now(timezone.utc).isoformat(),handoffCanonicalId='eco-cortex-handoff-20260913')
(OUT/'workboard.json').write_text(json.dumps(board,indent=2)+'\n')
receipt={'verifiedAt':board['nativeVerifiedAt'],'status':'verified','ids':IDS,'taskCount':len(IDS),'blockingEdgeCount':len(edges),'edges':edges,'nativeAcceptanceVerified':True,'nativeParentLinksVerified':True,'creationWarningsReconciled':['Batch graph ignored explicit id, status and acceptance_criteria fields; retained generated IDs and set acceptance via native bd update.'],'sharedTrackerRemoteConfigured':False,'historicalStatuses':{i:r['status'] for i,r in parent_map.items()}}
(OUT/'beads-sync.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt,indent=2))
