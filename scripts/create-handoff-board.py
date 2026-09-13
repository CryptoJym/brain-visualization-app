"""Create a portable task/dependency plan. This does not mutate canonical Beads."""
from pathlib import Path
from datetime import datetime,timezone
import json
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/handoff-20260913';OUT.mkdir(parents=True,exist_ok=True)
if (OUT/'beads-sync.json').exists():raise SystemExit('Native work board is already synchronized; do not regenerate or create duplicate tasks.')
def task(alias,title,priority,role,depends,paths,description,acceptance):
 return dict(alias=alias,title=title,priority=priority,type='task',requestedId='eco-ccg-'+alias.lower()+'-20260913',canonicalId=None,nativeStatus='not-synchronized',planStatus='ready' if not depends else 'blocked-by-plan-dependencies',ownerRole=role,dependsOn=depends,scope=paths,description=description,acceptance=acceptance,parent='eco-cq76kh')
tasks=[
 task('NG01','Reconcile graph checkpoint onto current verified Cortex source',1,'integration engineer',[],['new isolated worktree','graph-only checkpoint aae0e60'],
 'Start from the latest verified hero-editions branch, not the old 43ceccb graph base. Import only graph paths, retain original history and keep runtime integration off until accepted. Confirm active ownership and native release version.',
 ['Current production UI, required Male/Female control, backup and xAI service are preserved.','Graph checkpoint is present on a new named branch with clean ownership.','Existing regression baseline and nine prototype tests are recorded without calling them scientific validation.']),
 task('NG02','Build claim-level source, cohort and measurement provenance',1,'research engineer',[],['src/data/neurograph/evidenceRegistry.mjs','new source/claim schema','research audit docs'],
 'Review primary studies and relevant frameworks. Record actual task, population, outcome, estimate/uncertainty when available, nulls, corrections, read depth and cohort overlap. Separate component evidence, joint-effect evidence and editorial hypothesis. No numeric weights from publication type alone.',
 ['Every imported empirical claim has a result-specific locator and scope.','Null, conflicting and overlapping-cohort evidence is retained.','Unsupported/uncertain records are quarantined or explicitly labeled rather than upgraded.']),
 task('NG03','Reconcile functional ontology and typed graph edges',1,'graph engineer',['NG01','NG02'],['src/data/neurograph/systems.mjs','model.mjs','processes.mjs','operators.mjs','graph integrity tests'],
 'Resolve the partial unused process file and inconsistent domain mapping. Introduce stable IDs and deliberate process-to-system links. Distinguish measured association, task mapping, hypothetical interaction, context and narrative edges. Do not infer a joint mechanism from a shared citation.',
 ['All node and claim references resolve with explicit edge semantics.','ID stability, duplicate claims/cohorts and missing data are tested.','Distinct threat/safety, working-context and social processes are not accidentally collapsed by a generic UI-domain mapping.']),
 task('NG04','Replace uncalibrated confidence scoring with an auditable evidence contract',1,'methods engineer',['NG01','NG02'],['confidenceEngine.mjs','weights.mjs','evidence appraisals','method tests'],
 'Current weights and thresholds are editorial constants, not learned or calibrated. Separate reported fit, counterexample coverage, source directness/consistency, joint-effect evidence and individual measurement. Define a valid estimand/data protocol before any probability or effect-size claim.',
 ['No current supportIndex is represented as a probability, biomarker or measured certainty.','Tests do not require arbitrary high scores for a favored hero.','Perturbing unknown/counterexample/source-quality inputs has documented bounded behavior.']),
]
tasks.extend([
 task('NG05','Implement bounded compositional inference and explanations',1,'inference engineer',['NG03','NG04'],['compositionEngine.mjs','environmentEngine.mjs','explanationEngine.mjs','profileEngine.mjs','new graph tests'],
 'Evaluate eligible compositions with the accepted evidence contract. Preserve preferred eligible signatures, explicit counterexamples and unknowns. Bound pair/hyperedge traversal; counts of possible combinations are not numbers of validated relationships. Keep observed friction separate from proposed trade-offs.',
 ['Deterministic output, malformed inputs, source withdrawal and counterfactual response changes are tested.','No path manufactures anatomy or ability from age, sex, gender or history.','Each personal conclusion resolves to input observations; each research claim resolves to accepted evidence.']),
 task('NG06','Integrate accessible evidence graph and scientific report adapter',1,'frontend/report engineer',['NG05'],['new graph components','NeuroheroLab.jsx','CompassReports.jsx','report and backup adapters'],
 'Expose paths from observation to process to claim and source, with measured/hypothesized edges and accessible text. Preserve current short hero style, privacy appendices, stable hero/portrait IDs, device saves and encrypted backups. No private graph details go to image/design providers.',
 ['Desktop, 320/390/768 mobile and WebKit navigation are usable.','A4/Letter scientific explanation and hero PDFs are visually inspected.','Existing accepted image bytes, saved profiles and backup roundtrips remain valid; no automatic paid request.']),
 task('NG07','Independent review, complete regression and exact-artifact publication',1,'release/review engineer',['NG06'],['review evidence','test receipts','release scripts','completion handoff'],
 'Independently challenge representative evidence paths and misleading score/wording risks. Run affected full tests, keep failed receipts, verify an immutable artifact, re-read native production, preserve rollback, deploy only accepted output and verify public hashes and user flow.',
 ['Research review and software checks are distinguished.','Current source/commit, build hashes, provider version, rollback and live checks are recorded.','No capability is called clinically validated or calibrated without actual proof.']),
 task('OP01','Design optional public account and portrait entitlement rollout',3,'backend/privacy engineer',[],['future auth design','no current production mutation'],
 'The current xAI studio is a private-pass pilot. Assess real signup/account recovery, private access, lifecycle, quotas and costs before replacing it. An account does not by itself make questionnaire data confidential or end-to-end encrypted. Keep anonymous reflection and local backups functional.',
 ['Concrete identity, deletion, recovery and provider/data-transfer boundaries reviewed.','Separate user authorization and rollout acceptance before activating paid/public endpoints.']),
 task('OP02','Design consented longitudinal usefulness and calibration study',3,'research methods lead',['NG02','NG04'],['future research protocol only'],
 'Specify research questions, outcomes, counterexamples, repeatability, sampling, privacy, withdrawal and separate opt-in consent. Do not silently reuse private reflections or claim a completed meta-analysis from the registry.',
 ['A prespecified study/evaluation protocol is reviewed before data collection.','Product enjoyment, self-recognition, performance and neural measurement remain distinct outcomes.'])
])
board={'schema':'cortex-handoff-workboard/v1','generatedAt':datetime.now(timezone.utc).isoformat(),'canonicalTracker':'/Users/utlyze/.beads (Dolt server / eco)','nativeSyncStatus':'pending-native-read-write-verification','program':'eco-a318wk','graphParent':'eco-cq76kh','handoffRequestedId':'eco-cortex-handoff-20260913','tasks':tasks,'historicalItems':[{'id':'eco-iln18c','lastConfirmedStatus':'closed','scope':'live hero editions/required sex'},{'id':'eco-ii5x99','lastConfirmedStatus':'closed','scope':'portable profiles/portrait editions'},{'id':'eco-fxdv65','lastConfirmedStatus':'see xAI completion receipt','scope':'xAI portrait service'},{'id':'eco-a318wk','lastConfirmedStatus':'open in previous release record','scope':'broader Neurohero program'},{'id':'eco-cq76kh','lastConfirmedStatus':'open prototype work','scope':'unfinished graph'}]}
(OUT/'workboard.json').write_text(json.dumps(board,indent=2)+'\n')
for t in tasks:
 text='# '+t['alias']+' — '+t['title']+'\n\nPlan status: '+t['planStatus']+'. Native registration: '+t['nativeStatus']+'.\n\nParent: '+t['parent']+'. Intended native ID: '+t['requestedId']+'. Role: '+t['ownerRole']+'.\n\nDepends on: '+(', '.join(t['dependsOn']) or 'none')+'.\n\nScope: '+', '.join(t['scope'])+'.\n\n'+t['description']+'\n\n## Acceptance\n'+'\n'.join('- '+a for a in t['acceptance'])+'\n'
 (OUT/'tasks').mkdir(exist_ok=True);(OUT/'tasks'/(t['alias']+'.md')).write_text(text)
print('Created',len(tasks),'portable work items; canonical synchronization is explicitly pending.')
