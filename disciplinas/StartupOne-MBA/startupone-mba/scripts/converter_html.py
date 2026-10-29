from pathlib import Path
import json,html,re,zipfile,posixpath
from lxml import etree as E
R=Path(__file__).resolve().parents[1]
D=R/"documentos"
A=D/"assets"
inv=[]
esc=html.escape
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
# O estilo é mantido em documentos/leitura.css e tema.css, fora da conversão.
def validar_estilo(raiz):
 caminho=raiz/"documentos"/"leitura.css"
 for estilo in [caminho,raiz/"tema.css"]:
  if not estilo.is_file():
   raise FileNotFoundError(f"Estilo ausente: {estilo}. Restaure o arquivo de estilo antes de converter.")
 return caminho

def wrap(x,content,i):
 from bs4 import BeautifulSoup
 prev=f'<a href="{inv[i-1]["id"].lower()}.html">← Documento anterior</a>' if i else '<span></span>'
 nex=f'<a href="{inv[i+1]["id"].lower()}.html">Próximo documento →</a>' if i+1<len(inv) else '<a href="index.html">Voltar à biblioteca →</a>'
 soup=BeautifulSoup(content,'html.parser');toc=[]
 for j,h in enumerate(soup.select('h2,h3'),1):
  if not h.get('id'):h['id']=f'sec-{j}'
  toc.append(f'<li><a href="#{esc(h["id"])}">{esc(h.get_text(" ",strip=True))}</a></li>')
 for table in soup.find_all('table'):
  div=soup.new_tag('div',attrs={'class':'table-scroll'});table.wrap(div)
 for a in soup.find_all('a',href=True):
  if a['href'].startswith(('https://','http://')):a['rel']='noopener noreferrer';a['target']='_blank'
 for a in soup.find_all('img'):
  a['loading']='lazy'
  if not a.get('alt'):a['alt']='Ilustração preservada do documento original'
 return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{esc(x['nome'])} · Biblioteca Startup One</title><link rel="stylesheet" href="leitura.css"></head><body><a class="skip" href="#conteudo">Ir para o conteúdo</a><header><nav><a href="../index.html">← Projeto MBA</a><a href="index.html">Biblioteca completa</a><a href="../{esc(x['arquivo'])}" download>Baixar original</a></nav></header><main id="conteudo"><span class="source-badge">{x['id']} / DOCUMENTO INTEGRAL</span><h1>{esc(x['nome'])}</h1><div class="intro">Leitura HTML adaptada para celular, tablet e computador. Conteúdo da fonte histórica, preservado sem atualização de suas afirmações. <a href="../{esc(x['texto'])}">Extração em texto</a> disponível para conferência.</div><details class="toc"><summary>Navegar pelos tópicos ({len(toc)})</summary><ol>{''.join(toc)}</ol></details><article class="document">{str(soup)}</article><nav class="pager">{prev}{nex}</nav></main><footer><nav><a href="../index.html#fontes">Mapa das fontes</a><a href="index.html">Todos os documentos</a><a href="#conteudo">Voltar ao início ↑</a></nav></footer></body></html>'''

def docx_content(p,sid):
 z=zipfile.ZipFile(p); root=E.fromstring(z.read('word/document.xml')); rels=E.fromstring(z.read('word/_rels/document.xml.rels')); rr={r.get('Id'):r.get('Target') for r in rels}; count=0
 def paragraph(n):
  nonlocal count
  buf=[]
  for t in n.iter():
   if t.tag==f'{{{ns["w"]}}}t':buf.append(esc(t.text or ''))
   elif t.tag==f'{{{ns["w"]}}}tab':buf.append(' ')
   elif t.tag==f'{{{ns["w"]}}}br':buf.append('<br>')
   elif t.tag==f'{{{ns["a"]}}}blip':
    rid=t.get(f'{{{ns["r"]}}}embed');target=rr.get(rid)
    if target:
     name=posixpath.normpath('word/'+target); data=z.read(name);count+=1;nameout=f'{sid.lower()}-image-{count}{Path(name).suffix}';(A/nameout).write_bytes(data);buf.append(f'<figure><img src="assets/{nameout}" alt="Imagem {count} do documento {sid}"><figcaption>Imagem {count} preservada do original.</figcaption></figure>')
  text=''.join(buf)
  if not text.strip():return ''
  style=n.find('w:pPr/w:pStyle',ns);s=style.get(f'{{{ns["w"]}}}val','') if style is not None else ''
  tag='h2' if re.search(r'heading1|t.tulo1',s,re.I) else 'h3' if re.search(r'heading|t.tulo',s,re.I) else 'p'
  # linkify plain visible URLs
  text=re.sub(r'(?<!["=>])(https?://[^\s<]+)',lambda m:'<a href="'+m.group(1)+'">'+m.group(1)+'</a>',text)
  return f'<{tag}>{text}</{tag}>'
 out=[]
 for n in root.find('w:body',ns):
  if E.QName(n).localname=='p':out.append(paragraph(n))
  elif E.QName(n).localname=='tbl':
   out.append('<table>'+''.join('<tr>'+''.join('<td>'+''.join(paragraph(p) for p in c.findall('.//w:p',ns))+'</td>' for c in row.findall('w:tc',ns))+'</tr>' for row in n.findall('w:tr',ns))+'</table>')
 print(sid,'DOCX imagens',count)
 return ''.join(out)

def atualizar_index(conteudo,inventario):
 """Atualiza os atalhos gerados sem duplicá-los nem substituir conteúdo autoral."""
 from lxml import html as H
 pagina=H.document_fromstring(conteudo)
 for a in pagina.xpath('//a[@href]'):
  for x in inventario:
   if a.get('href') in [x['texto'],str(Path(x['texto']).with_suffix('.html'))]:
    a.set('href',x['html'])
   if a.get('href')==x['arquivo']:
    a.set('download','')

 avisos=[]
 for aviso in pagina.xpath('//div[contains(concat(" ",normalize-space(@class)," ")," notice ")]'):
  texto=aviso.text_content().strip()
  legado=(texto.startswith('Pacote offline: comece por esta página ou pela ')
          and 'Descompacte o ZIP antes de navegar' in texto
          and aviso.xpath('.//a[@href="documentos/index.html"]'))
  if aviso.get('data-offline-package') is not None or legado:
   avisos.append(aviso)
 if avisos:
  avisos[0].set('data-offline-package','')
  for duplicado in avisos[1:]:
   duplicado.drop_tree()
 else:
  secao=pagina.find('.//section')
  if secao is not None:
   aviso=H.fragment_fromstring('<div class="notice" data-offline-package="">Pacote offline: comece por esta página ou pela <a href="documentos/index.html">Biblioteca integral em HTML responsivo</a>. Todos os documentos têm navegação, leitura HTML e acesso às imagens. Descompacte o ZIP antes de navegar; não é necessário instalar aplicativos.</div>')
   secao.insert(min(2,len(secao)),aviso)

 antigo='Imagens, diagramas e formatação devem ser consultados nos originais, pois a extração textual não os reproduz integralmente.'
 novo='As versões HTML incluem imagens incorporadas dos documentos Word e reproduções de todas as páginas dos PDFs. Os originais permanecem disponíveis para conferência.'
 for p in pagina.xpath('//p'):
  for no in p.iter():
   if no.text:
    no.text=no.text.replace(antigo,novo)
   if no.tail:
    no.tail=no.tail.replace(antigo,novo)

 nav=pagina.find('.//nav')
 if nav is not None:
  gerados=[a for a in nav.xpath('.//a[@href="documentos/index.html"]')
           if a.text_content().strip()=='Biblioteca HTML integral']
  for duplicado in gerados[1:]:
   duplicado.drop_tree()
  if not nav.xpath('.//a[@href="documentos/index.html"]'):
   nav.append(H.fragment_fromstring('<a href="documentos/index.html">Biblioteca HTML integral</a>'))
 return H.tostring(pagina,encoding='unicode',method='html',doctype='<!doctype html>')

def main():
 global inv
 # CSS e tema são fontes autoritativas mantidas manualmente, nunca geradas aqui.
 validar_estilo(R)
 from bs4 import BeautifulSoup
 inv=json.loads((R/'inventario.json').read_text())
 D.mkdir(exist_ok=True)
 A.mkdir(exist_ok=True)
 for i,x in enumerate(inv):
  p=R/x['arquivo'];x['html']='documentos/'+x['id'].lower()+'.html'
  if p.suffix=='.docx':content=docx_content(p,x['id'])
  elif p.suffix=='.pdf':
   import fitz
   doc=fitz.open(p);pages=[]
   for j,page in enumerate(doc,1):
    fname=f'{x["id"].lower()}-pagina-{j:02}.jpg';page.get_pixmap(matrix=fitz.Matrix(1.6,1.6)).save(str(A/fname))
    txt=page.get_text(sort=True).strip()
    pages.append(f'<section class="pdf-page"><h2 id="pagina-{j}">Página {j} de {len(doc)}</h2><div class="pdf-text">{esc(txt) if txt else "Página visual — conteúdo preservado na imagem abaixo."}</div><details><summary>Ver página original com imagens e diagramas</summary><a href="assets/{fname}"><img class="pdf-picture" src="assets/{fname}" alt="Reprodução integral da página {j}" loading="lazy"></a></details></section>')
   print(x['id'],'PDF páginas',len(doc));content=''.join(pages)
  else:
   s=BeautifulSoup(p.read_text(),'html.parser')
   for t in s(['style','script','link','meta']):t.decompose()
   for t in s.find_all(True):
    for att in ['style','onclick']:t.attrs.pop(att,None)
   content=''.join(str(c) for c in (s.body.contents if s.body else s.contents))
  (D/(x['id'].lower()+'.html')).write_text(wrap(x,content,i))
  # legacy links redirect via a genuine usable HTML with new navigation
  old=R/x['texto'];old.with_suffix('.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=../'+x['html']+'"><title>Leitura HTML</title><a href="../'+x['html']+'">Abrir documento em HTML responsivo</a></html>')
 (R/'inventario.json').write_text(json.dumps(inv,ensure_ascii=False,indent=2))
 cards=''.join(f'<li data-doc><h2><a href="{x["id"].lower()}.html">{x["id"]} · {esc(x["nome"])}</a></h2><p><a href="{x["id"].lower()}.html">Ler conteúdo integral em HTML →</a></p></li>' for x in inv)
 (D/'index.html').write_text(f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Biblioteca integral · Startup One</title><link rel="stylesheet" href="leitura.css"></head><body><header><a href="../index.html">← Voltar ao projeto MBA</a></header><main><span class="source-badge">ACERVO / 13 DOCUMENTOS</span><h1>Biblioteca integral em HTML</h1><p>Todos os materiais em páginas responsivas. PDFs incluem texto para leitura e reprodução visual de todas as páginas. Documentos Word incluem as imagens incorporadas. Os Canvas foram adaptados para leitura em telas menores.</p><label for="busca">Buscar documento pelo nome</label><input id="busca" type="search" placeholder="Ex.: Canvas, oportunidade, Aula0"><p id="resultado" aria-live="polite">13 documentos</p><ul style="list-style:none;padding:0">{cards}</ul></main><footer><a href="../index.html">Voltar ao projeto MBA</a></footer><script>const input=document.querySelector('#busca');input.addEventListener('input',()=>{{let n=0;for(const el of document.querySelectorAll('[data-doc]')){{el.hidden=!el.textContent.toLocaleLowerCase().includes(input.value.toLocaleLowerCase());if(!el.hidden)n++}}document.querySelector('#resultado').textContent=n+' documentos'}});</script></body></html>''')
 # A atualização da página principal pode ser repetida sem duplicar a navegação.
 pagina=R/"index.html"
 pagina.write_text(atualizar_index(pagina.read_text(),inv))
 (R/'LEIA-ME.html').write_text('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Como navegar</title><link rel="stylesheet" href="documentos/leitura.css"><main><h1>Como navegar pelo material</h1><ol><li>Baixe e descompacte todo o ZIP, mantendo as pastas juntas.</li><li>Abra <a href="index.html">a página inicial do projeto MBA</a>.</li><li>Consulte os documentos na <a href="documentos/index.html">biblioteca integral em HTML</a>.</li><li>Use o índice de tópicos e os links anterior/próximo para navegar.</li><li>Nos PDFs, abra “Ver página original” para consultar imagens e diagramas.</li></ol><p>Funciona offline. Links externos exigem internet. Decisões registradas na página inicial ficam somente no navegador e podem ser exportadas.</p></main></html>')
 print('Conversão concluída')

if __name__ == "__main__":
 main()
