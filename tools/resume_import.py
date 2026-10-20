"""Resume verified local imports after OneDrive downloads; never reads credentials."""
from pathlib import Path
import argparse,hashlib,json,shutil,sys
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source',required=True,type=Path)
parser.add_argument('--apply',action='store_true',help='Copy files; default only reports availability.')
parser.add_argument('--replace-placeholders',action='store_true',help='Replace generated README pages explicitly labelled as pending.')
args=parser.parse_args();root=Path(__file__).resolve().parents[1];source=args.source.resolve()
manifest=root/'catalogo/pendencias-importacao.json';pending=json.loads(manifest.read_text());remaining=[];copied=[];conflicts=[];available=0
existing=json.loads((root/'catalogo/importacao.json').read_text())
for item in pending:
 src=(source/item['origem']).resolve();dst=(root/item['destino']).resolve()
 try:src.relative_to(source);dst.relative_to(root)
 except ValueError:raise SystemExit('Unsafe manifest path')
 if not src.is_file() or getattr(src.stat(),'st_flags',0)&0x40000000:remaining.append(item);continue
 available+=1
 if not args.apply:continue
 digest=hashlib.sha256(src.read_bytes()).hexdigest()
 if dst.exists():
  current=hashlib.sha256(dst.read_bytes()).hexdigest()
  placeholder=False
  if args.replace_placeholders and dst.name=='README.md':
   try:placeholder='importação pendente' in dst.read_text().split('\n',1)[0].lower()
   except UnicodeError:pass
  if current!=digest and not placeholder:conflicts.append(item['destino']);remaining.append(item);continue
 dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
 if hashlib.sha256(dst.read_bytes()).hexdigest()!=digest:raise SystemExit('Copy verification failed: '+item['destino'])
 entry={**item,'bytes':src.stat().st_size,'sha256':digest,'sha256_destino':digest,'estado':'copiado-verificado','verificacao':'Fonte atual lida após download.'};copied.append(entry)
 if item['versionado']:existing.append(entry)
if args.apply:
 manifest.write_text(json.dumps(remaining,ensure_ascii=False,indent=2)+'\n')
 (root/'catalogo/importacao.json').write_text(json.dumps(existing,ensure_ascii=False,indent=2)+'\n')
 (root/'catalogo/retomada-importacao.json').write_text(json.dumps({'copiados':copied,'conflitos':conflicts,'pendentes':len(remaining)},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'modo':'apply' if args.apply else 'dry-run','disponiveis':available,'copiados':len(copied),'pendentes':len(remaining) if args.apply else len(pending)-available,'conflitos':conflicts},ensure_ascii=False,indent=2))
if args.apply:print('Revise links/catálogos, atualize o portal e execute tools/validate_repo.py antes do commit. Nenhum push foi executado.')
sys.exit(bool(conflicts))
