"""Check conversion hashes, generated reader links, media and unsafe HTML. No dependencies."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote
import hashlib,json,sys

root=Path(__file__).resolve().parents[1]
errors=[]
entries=json.loads((root/'catalogo/biblioteca.json').read_text())
index=json.loads((root/'catalogo/indice-biblioteca.json').read_text())
pending=json.loads((root/'catalogo/pendencias-conversao.json').read_text())
for entry in entries:
    md=root/entry['markdown']
    if not md.is_file():errors.append('Markdown missing: '+entry['markdown']);continue
    if hashlib.sha256(md.read_bytes()).hexdigest()!=entry['sha256_markdown']:errors.append('Markdown hash changed: '+entry['markdown'])
class Check(HTMLParser):
    def __init__(self,path):super().__init__();self.path=path
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        if tag in ['iframe','object','embed','form']:errors.append('Unsafe element in '+str(self.path))
        if tag=='script' and self.path.name!='index.html':errors.append('Script in document reader: '+str(self.path))
        if any(k.lower().startswith('on') for k in attrs):errors.append('Inline event in '+str(self.path))
        for attr in ['href','src']:
            href=unquote(attrs.get(attr,''))
            if href.lower().startswith(('javascript:','vbscript:')):errors.append('Unsafe URL in '+str(self.path))
            if not href or href.startswith(('https:','http:','mailto:','data:','#')):continue
            target=(self.path.parent/href.split('#')[0]).resolve()
            if not target.exists():errors.append('Broken reader link: '+str(self.path.relative_to(root))+' -> '+href)
for p in (root/'biblioteca').rglob('*.html'):Check(p).feed(p.read_text())
for entry in index:
    for key in ['markdown','html']:
        if not (root/entry[key]).is_file():errors.append('Missing indexed '+key+': '+entry[key])
result={'documentos_convertidos_ou_reutilizados':len(entries),'origens_cobertas':sum(len(e['origens']) for e in entries),
        'documentos_no_indice':len(index),'fontes_pendentes':len(pending),'errors':sorted(set(errors))}
(root/'catalogo/validacao-biblioteca.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2));sys.exit(bool(errors))
