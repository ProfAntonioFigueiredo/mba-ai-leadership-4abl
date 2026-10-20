"""Reproduce the comparison without changing the source project (Python stdlib)."""
from pathlib import Path
import hashlib, json, os, shutil, subprocess, tempfile, time
root=Path(__file__).resolve().parents[1]
source=root.with_name('speakup-lovable')
reports=root/'reports'; reports.mkdir(exist_ok=True)
expected=json.loads((reports/'original-sha256.json').read_text())
def hashes():
    return {str(p.relative_to(source)):hashlib.sha256(p.read_bytes()).hexdigest() for p in source.rglob('*') if p.is_file() and not {'node_modules','dist','.git'}.intersection(p.relative_to(source).parts)}
if hashes()!=expected: raise SystemExit('Original changed since initial inventory; review baseline before comparing.')
baseline=Path(tempfile.mkdtemp(prefix='speakup-comparison-',dir=tempfile.gettempdir()))
for relative in expected:
    target=baseline/relative; target.parent.mkdir(parents=True,exist_ok=True); shutil.copy2(source/relative,target)
(baseline/'node_modules').symlink_to(root/'node_modules',target_is_directory=True)
results=[]
def run(name,command,cwd=root,extra=None,expected_failure=False):
    env={**os.environ,**(extra or {})};start=time.monotonic()
    process=subprocess.run(command,cwd=cwd,env=env,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
    (reports/(name+'.log')).write_text(process.stdout)
    row={'name':name,'command':command,'cwd':str(cwd),'environment':extra or {},'exit_code':process.returncode,'expected_failure':expected_failure,'elapsed_seconds':round(time.monotonic()-start,3)}
    results.append(row);print(name,process.returncode,flush=True)
    (reports/'validation.json').write_text(json.dumps({'reference_date':'2026-10-19','node':subprocess.check_output(['node','--version'],text=True).strip(),'baseline':str(baseline),'original_unchanged':hashes()==expected,'checks':results},indent=2))
run('tests-original',['npm','test'],cwd=baseline)
run('build-original',['npm','run','build'],cwd=baseline)
run('regression-original',['node','--test','tests/regression.test.mjs'],extra={'SPEAKUP_TARGET':str(baseline)},expected_failure=True)
run('database-original-regression',['node','--test','tests/database.test.mjs'],extra={'SPEAKUP_BASELINE_DB':'1'},expected_failure=True)
run('tests-sdd',['npm','test'])
run('build-sdd',['npm','run','build'])
run('format-sdd',['npm','run','format:check'])
run('browser-original',['npm','run','test:e2e'],extra={'SPEAKUP_BASELINE_UI':str(baseline)},expected_failure=True)
run('browser-sdd',['npm','run','test:e2e'])
run('dependencies',['npm','ls','--depth=0','--json'])
(reports/'dependencies.json').write_text((reports/'dependencies.log').read_text())
failed=[x['name'] for x in results if x['exit_code'] and not x['expected_failure']]
if failed:raise SystemExit('Unexpected failures: '+', '.join(failed))
print('Comparison completed; original unchanged:',hashes()==expected)
