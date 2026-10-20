"""Validate the portfolio without installing dependencies or accessing external services."""
from pathlib import Path
import ast, hashlib, json, re, subprocess, sys
root=Path(__file__).resolve().parents[1]
errors=[];warnings=[]
registry=json.loads((root/'catalogo/disciplinas.json').read_text())
if len(registry)!=21:errors.append('Expected 21 catalogued disciplines.')
ids=[d['id'] for d in registry]
if len(ids)!=len(set(ids)):errors.append('Duplicate discipline ID.')
for d in registry:
 folder=root/d['pasta']
 for path in ['README.md','disciplina.json','aulas/README.md','projetos/README.md','entregas/README.md','referencias/README.md']:
  if not (folder/path).is_file():errors.append(f'Missing {d["pasta"]}/{path}')
 for p in d['projetos']:
  if not (folder/p['pasta']/'README.md').is_file():errors.append(f'Project README missing: {p["pasta"]}')
imported=json.loads((root/'catalogo/importacao.json').read_text())
for entry in imported:
 p=root/entry['destino']
 if not p.is_file():errors.append('Imported file missing: '+entry['destino']);continue
 digest=hashlib.sha256(p.read_bytes()).hexdigest()
 if digest!=entry['sha256_destino']:warnings.append('Edited after import: '+entry['destino'])
 if '/speakup-lovable/' in entry['destino'] and digest!=entry['sha256']:errors.append('Original baseline changed: '+entry['destino'])
if (root/'.git').is_dir():
 paths=subprocess.check_output(['git','ls-files','--cached','-z'],cwd=root).decode().split('\0');files=[root/p for p in paths if p and (root/p).is_file()]
else:
 files=[p for p in root.rglob('*') if p.is_file() and not {'acervo-local','node_modules','.venv','.git','dist','test-results','__pycache__'}.intersection(p.relative_to(root).parts)]
secret=re.compile(r'\b(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')
for p in files:
 rel=p.relative_to(root).as_posix()
 if 'acervo-local/' in rel or '/node_modules/' in rel or '/.git/' in rel:errors.append('Forbidden tracked path: '+rel)
 if p.name in ['.env','.env.local','.env.production'] or p.suffix in ['.pem','.key']:errors.append('Forbidden credential file: '+rel)
 if p.stat().st_size>=50*1024*1024:errors.append('File exceeds 50 MiB: '+rel)
 if p.suffix=='.py':
  try:ast.parse(p.read_text(),filename=rel)
  except SyntaxError as e:errors.append(f'Python syntax error: {rel}: {e}')
 if p.suffix=='.ipynb':
  try:json.loads(p.read_text())
  except ValueError:errors.append('Invalid notebook JSON: '+rel)
 if p.suffix in ['.md','.json','.py','.js','.jsx','.mjs','.ts','.yml','.yaml','.txt','.html']:
  try:
   if secret.search(p.read_text()):errors.append('Credential pattern detected: '+rel)
  except UnicodeError:pass
# Check generated navigation links; imported historical docs retain their context.
imported_paths={x['destino'] for x in imported}
for p in files:
 if p.suffix!='.md' or p.relative_to(root).as_posix() in imported_paths:continue
 for href in re.findall(r'\]\(<?([^\n)>]+)>?\)',p.read_text()):
  if href.startswith(('http:','https:','mailto:','#','/')):continue
  target=p.parent/href.split('#')[0]
  if not target.exists():errors.append(f'Navigation target missing: {p.relative_to(root)} -> {href}')
result={'reference_date':'2026-10-19','disciplines':len(registry),'checked_files':len(files),'imported_files':len(imported),'errors':sorted(set(errors)),'warnings':sorted(set(warnings)),'scope':'Structure, imported hashes, baseline identity, file policy, Python syntax, notebook JSON and generated navigation. Not an application or production certification.'}
(root/'catalogo/validacao.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
sys.exit(bool(errors))
