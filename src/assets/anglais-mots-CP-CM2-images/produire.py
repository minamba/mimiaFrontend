import pathlib,json,re,sys,shutil,hashlib,csv,zipfile,collections,math
from pypdf import PdfReader
from PIL import Image,ImageDraw,ImageFont
ROOT=pathlib.Path(__file__).parent
INV=ROOT/'inventaire.json'
PDF=pathlib.Path('C:/Users/daryu/Desktop/mimia/anglais-mots-CP-CM2-images.pdf')
NUMBERS={'one':1,'four':4,'five':5,'six':6,'seven':7,'eight':8,'nine':9,'ten':10,'eleven':11,'twelve':12,'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,'nineteen':19,'twenty':20}
COLORS={'red':'#E33435','blue':'#2674D9','green':'#299746','yellow':'#F6BD15','pink':'#ED63A2','black':'#17222E','white':'#FFFFFF','brown':'#92572E','purple':'#9A51CE','grey':'#788798'}

def save(a): INV.write_text(json.dumps(a,ensure_ascii=False,indent=2),encoding='utf8')
def load(): return json.loads(INV.read_text(encoding='utf8'))
def write_state(a):
 counts=collections.Counter(e['etat'] for e in a)
 (ROOT/'reprise.json').write_text(json.dumps({'total':len(a),'composees':counts['compose']+counts['valide'],'validees':counts['valide'],'restantes':sum(e['etat']=='a-faire' for e in a),'etats':counts},ensure_ascii=False,indent=2),encoding='utf8')
def compose(e,base):
 if e['mot'] in ('england','america','santa','halloween','easter'): e['anglais']=e['mot'].capitalize()
 s=pathlib.Path(e['source']); target=s/'dessin.png'
 if pathlib.Path(base).resolve()!=target.resolve(): shutil.copyfile(base,target)
 art=Image.open(target).convert('RGBA'); assert art.getchannel('A').getextrema()[0]==0,'Fond non transparent'
 im=Image.new('RGBA',(1024,1024))
 number=NUMBERS.get(e['mot'])
 if number and number<=10:
  art.thumbnail((610,620),Image.Resampling.LANCZOS)
  im.alpha_composite(art,(360+(610-art.width)//2,45+(620-art.height)//2))
  d=ImageDraw.Draw(im); f=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',230 if number<10 else 180)
  b=d.textbbox((0,0),str(number),font=f); d.text(((350-f.getlength(str(number)))/2,345-(b[1]+b[3])/2),str(number),font=f,fill='#FF8A00',stroke_width=7,stroke_fill='#FFF8DF')
 else:
  art.thumbnail((900,665),Image.Resampling.LANCZOS); im.alpha_composite(art,((1024-art.width)//2,25+(665-art.height)//2))
 drawing=im.copy(); d=ImageDraw.Draw(im)
 word=e['anglais']; color=COLORS.get(e['mot'],'#194C6D') if e['theme']=='Les couleurs' else '#194C6D'
 for size in range(172,49,-1):
  f=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',size)
  if f.getlength(word)<=920: break
 b=d.textbbox((0,0),word,font=f); d.text(((1024-f.getlength(word))/2,795-(b[1]+b[3])/2),word,font=f,fill=color,stroke_width=6,stroke_fill='#FFF8DF')
 fr=e['francais_affiche']
 for fs in range(78,34,-1):
  ff=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',fs)
  if ff.getlength(fr)<=910: break
 b=d.textbbox((0,0),fr,font=ff); d.text(((1024-ff.getlength(fr))/2,946-(b[1]+b[3])/2),fr,font=ff,fill='#194C6D',stroke_width=4,stroke_fill='#FFF8DF')
 im.save(e['png']); im.save(e['webp'],lossless=True,exact=True,method=4)
 assert Image.open(e['png']).crop((0,0,1024,700)).tobytes()==drawing.crop((0,0,1024,700)).tobytes()
 e.update(etat='compose',dimensions=[1024,1024],transparence=True,sha256=hashlib.sha256(pathlib.Path(e['png']).read_bytes()).hexdigest())
 (s/'texte.json').write_text(json.dumps({'anglais':word,'francais':fr,'taille_anglais':size,'taille_francais':fs,'couleur_anglais':color,'nombre_illustre':number},ensure_ascii=False,indent=2),encoding='utf8')

def init():
 a=[]; level=None; theme=None
 for page,p in enumerate(PdfReader(PDF).pages,1):
  lines=p.extract_text().splitlines(); i=0
  while i<len(lines):
   line=lines[i].strip(); m=re.fullmatch(r'(CP|CE1|CE2|CM1|CM2) · (\d+) mots',line)
   if m: level=m[1]; i+=1; continue
   if re.fullmatch(r'(Les?|La|L\x27) .+ \(\d+\)',line) or re.fullmatch(r"L'école \(\d+\)",line):
    theme=re.sub(r' \(\d+\)$','',line); i+=1; continue
   if level and theme and re.fullmatch('[a-z]+',line):
    fr,description=lines[i+1].strip(),lines[i+2].strip(); word=line
    folder=ROOT/level/'Anglais'; src=folder/'sources'/word; src.mkdir(parents=True,exist_ok=True)
    a.append(dict(numero=len(a)+1,mot=word,anglais=word.capitalize() if word in ('england','america','santa') else word,francais=fr,francais_affiche=fr[0].upper()+fr[1:],description=description,niveau=level,theme=theme,page=page,png=str(folder/(word+'.png')),webp=str(folder/(word+'.webp')),source=str(src),etat='a-faire'))
    i+=3; continue
   i+=1
 assert len(a)==242,(len(a),collections.Counter(e['niveau'] for e in a))
 assert len({e['mot'] for e in a})==242
 assert dict(collections.Counter(e['niveau'] for e in a))=={'CP':53,'CE1':63,'CE2':40,'CM1':46,'CM2':40}
 save(a); write_state(a); (ROOT/'texte-source.txt').write_text('\n\n'.join(p.extract_text() for p in PdfReader(PDF).pages),encoding='utf8')
 print('INVENTAIRE',len(a))

def reuse(a):
 r=ROOT.parent
 fr=json.loads((r/'mots-CP-images/inventaire.json').read_text(encoding='utf8'))
 sy=json.loads((r/'syllabes-CP-CE1-images/inventaire.json').read_text(encoding='utf8'))
 en=json.loads((r/'anglais-sons-CP-CM2-images/inventaire.json').read_text(encoding='utf8'))
 lookup={e['mot']:e['fichier'] for e in fr}; lookup.update({e['mot_affiche']:str(pathlib.Path(e['source'])/'dessin.png') for e in sy})
 lookup.update({e['francais']:str(pathlib.Path(e['source'])/'dessin.png') for e in en})
 special={'red':'pomme','green':'feuille','yellow':'canard','pink':'cochon','white':'nuage','purple':'grappe','bread':'pain','teddy':'nounours','schoolbag':'sac','rubber':'gomme','glue':'glu','santa':'noël','small':'fourmi','slow':'escargot','cloud':'nuage','fog':'brume','tooth':'dent','world':'globe','one':'pomme','five':'main'}
 fresh=set('blue black brown grey four six seven eight nine ten horse monkey spider owl penguin kangaroo dolphin shark hamster cookie honey shoes socks scarf gloves boots shorts jeans jumper ruler schoolbag glue desk board paper table sofa bathroom bedroom kitchen stairs garden snow wind rainy cloudy windy snowy hot winter summer spring ship taxi school hospital library shop supermarket street city river farm doctor teacher farmer pilot driver happy sad hungry tired big tall short fast strong funny dirty clean old ugly jump swim sing read write cook eat drink walk play sit stand wash listen speak basketball tennis halloween easter party shoulder toe tummy feet england america'.split())
 for e in a:
  w=e['mot']; key=special.get(w,e['francais'])
  if w in fresh or (w in NUMBERS and NUMBERS[w]>=11) or w in ('circle','square','triangle','star','heart'): continue
  if key in lookup:
   e['origine_dessin']=lookup[key]; compose(e,lookup[key])
 save(a); write_state(a)
 print(json.dumps({'reutilisees':sum(e['etat']=='compose' for e in a),'restantes':[{k:e[k] for k in ('numero','mot','francais','description')} for e in a if e['etat']=='a-faire']},ensure_ascii=False))

def exact_assets(a):
 for e in a:
  w=e['mot']; n=NUMBERS.get(w)
  if not ((n and n>=11) or w in ('circle','square','triangle','star','heart','england','america')): continue
  im=Image.new('RGBA',(1000,1000)); d=ImageDraw.Draw(im)
  if n:
   f=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',600); txt=str(n); b=d.textbbox((0,0),txt,font=f)
   d.text(((1000-f.getlength(txt))/2,500-(b[1]+b[3])/2),txt,font=f,fill='#FF8A00',stroke_width=13,stroke_fill='#194C6D')
  elif w in ('england','america'):
   left,top,width,height=(44,260,912,480) if w=='america' else (40,260,920,460)
   d.rectangle((left,top,left+width,top+height),fill='white')
   if w=='england':
    d.rectangle((left,top+height*.4,left+width,top+height*.6),fill='#CE1835');d.rectangle((left+width/2-height*.1,top,left+width/2+height*.1,top+height),fill='#CE1835')
   else:
    for j in range(13):
     if j%2==0:d.rectangle((left,top+j*height/13,left+width,top+(j+1)*height/13),fill='#B22234')
    cw,ch=width*.4,height*7/13;d.rectangle((left,top,left+cw,top+ch),fill='#3C3B6E')
    for row in range(9):
     count=6 if row%2==0 else 5
     for col in range(count):
      cx=left+(col+(.5 if count==6 else 1))*cw/6;cy=top+(row+1)*ch/10
      rad=height*.0308
      pts=[(cx+(rad if k%2==0 else rad*.381966)*math.sin(k*math.pi/5),cy-(rad if k%2==0 else rad*.381966)*math.cos(k*math.pi/5)) for k in range(10)]
      d.polygon(pts,fill='white')
   d.rectangle((left,top,left+width,top+height),outline='#194C6D',width=4)
  elif w=='circle': d.ellipse((150,150,850,850),fill='#3599EE',outline='#194C6D',width=20); d.ellipse((205,205,795,795),fill=(0,0,0,0))
  elif w=='square': d.rectangle((150,150,850,850),fill='#4EBEA4',outline='#194C6D',width=20)
  elif w=='triangle': d.polygon([(500,130),(900,830),(100,830)],fill='#FFB64D',outline='#194C6D',width=20)
  elif w=='star':
   pts=[(500+(375 if i%2==0 else 165)*math.sin(i*math.pi/5),500-(375 if i%2==0 else 165)*math.cos(i*math.pi/5)) for i in range(10)]
   d.polygon(pts,fill='#FFD447',outline='#194C6D',width=18)
  else:
   pts=[]
   for i in range(600):
    t=i*2*math.pi/600; x=16*math.sin(t)**3; y=13*math.cos(t)-5*math.cos(2*t)-2*math.cos(3*t)-math.cos(4*t); pts.append((500+24*x,455-24*y))
   d.polygon(pts,fill='#ED455A',outline='#8C2441',width=16)
  p=pathlib.Path(e['source'])/'dessin.png'; im.save(p); compose(e,p); e['methode']='Construction exacte : nombre ou forme géométrique'
 save(a); write_state(a); print('ASSETS EXACTS',sum(e['etat']=='compose' for e in a))

def adjust(a):
 r=ROOT.parent;fr=json.loads((r/'mots-CP-images/inventaire.json').read_text(encoding='utf8'));sy=json.loads((r/'syllabes-CP-CE1-images/inventaire.json').read_text(encoding='utf8'));en=json.loads((r/'anglais-sons-CP-CM2-images/inventaire.json').read_text(encoding='utf8'))
 f={e['mot']:e['fichier'] for e in fr};s={e['mot_affiche']:str(pathlib.Path(e['source'])/'dessin.png') for e in sy};eng={e['anglais'].lower():str(pathlib.Path(e['source'])/'dessin.png') for e in en}
 forced={'baby':f['bébé'],'fish':f['poisson'],'hen':f['poule'],'arm':f['bras'],'leg':f['jambe'],'foot':f['pied'],'tummy':f['ventre'],'grape':s['grappe'],'birthday':eng['cake'],'tall':eng['giraffe'],'read':s['lire']}
 for e in a:
  if e['mot'] in ('ball','panda','santa'): e['etat']='a-faire'
  if e['mot'] in forced:e['origine_dessin']=forced[e['mot']];compose(e,forced[e['mot']])
 save(a);write_state(a);print('AJUSTEMENTS',sum(e['etat']=='compose' for e in a))

def finish(a):
 errors=[]
 for e in a:
  try:
   source_dir=pathlib.Path(e['source']); prompt_file=source_dir/'prompt.txt'
   if prompt_file.exists() and prompt_file.read_text(encoding='utf-8-sig').lstrip().startswith('Use case:'):
    e.pop('origine_dessin',None);e['methode']='Outil image_gen intégré ; légendes composées localement'
   elif 'origine_dessin' in e:
    e['methode']='Réutilisation du dessin indiqué ; nouvelles légendes anglaise et française'
   if not prompt_file.exists():
    prompt_file.write_text(e.get('methode','Illustration pédagogique manga')+'\nSujet : '+e['description']+'\nSource : '+e.get('origine_dessin','construction exacte documentée dans produire.py'),encoding='utf8')
   e['prompt_fichier']=str(prompt_file);e['annotations']=str(source_dir/'texte.json')
   im=Image.open(e['png']).convert('RGBA'); assert im.size==(1024,1024) and im.getchannel('A').getextrema()[0]==0
   wp=Image.open(e['webp']).convert('RGBA'); assert wp.tobytes()==im.tobytes(),'WebP différent'
   t=json.loads((pathlib.Path(e['source'])/'texte.json').read_text(encoding='utf8')); assert t['anglais']==e['anglais'] and t['francais']==e['francais_affiche']
   assert Image.open(e['png']).mode=='RGBA'; assert hashlib.sha256(pathlib.Path(e['png']).read_bytes()).hexdigest()==e['sha256']
   e['etat']='valide'
  except Exception as ex: errors.append({'mot':e['mot'],'erreur':repr(ex)})
 save(a);write_state(a)
 report={'attendu':242,'valides':sum(e['etat']=='valide' for e in a),'classes':dict(collections.Counter(e['niveau'] for e in a)),'erreurs':errors}
 (ROOT/'controle-final.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
 if errors: print(json.dumps(report,ensure_ascii=False));sys.exit(1)
 with (ROOT/'correspondance.csv').open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.writer(f,delimiter=';');w.writerow(['Classe','Thème','Anglais','Français','Image']);w.writerows((e['niveau'],e['theme'],e['anglais'],e['francais'],pathlib.Path(e['webp']).relative_to(ROOT)) for e in a)
 dest=ROOT.parent/(ROOT.name+'-242-images.zip')
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED) as z:
  for e in a:
   for k in ('png','webp'): z.write(e[k],str(pathlib.Path(e[k]).relative_to(ROOT)))
  for name in ('inventaire.json','controle-final.json','correspondance.csv'):z.write(ROOT/name,name)
 with zipfile.ZipFile(dest) as z: assert z.testzip() is None and len([s for s in z.namelist() if s.endswith('.png')])==242 and len([s for s in z.namelist() if s.endswith('.webp')])==242
 print(json.dumps(report,ensure_ascii=False));print(dest)

def reuse_final(a):
 old=json.loads((ROOT.parent/'mots-CP-images/inventaire.json').read_text(encoding='utf8'))
 hot=next(e['fichier'] for e in old if e['mot']=='chaud')
 beach=next(str(pathlib.Path(e['source'])/'dessin.png') for e in a if e['mot']=='beach')
 brother=next(str(pathlib.Path(e['source'])/'dessin.png') for e in a if e['mot']=='brother')
 for e in a:
  if e['mot'] in ('hot','summer','short'):
   p={'hot':hot,'summer':beach,'short':brother}[e['mot']];e['origine_dessin']=p;compose(e,p)
   (pathlib.Path(e['source'])/'prompt.txt').write_text('Reutilisation de la source inspectee : '+p,encoding='utf8')
 save(a);write_state(a);print('Sources propres reprises : hot, summer et short')

if __name__=='__main__':
 cmd=sys.argv[1]
 if cmd=='init': init()
 else:
  a=load()
  if cmd=='reuse':reuse(a)
  elif cmd=='adjust':adjust(a)
  elif cmd=='exact':exact_assets(a)
  elif cmd=='reuse-final':reuse_final(a)
  elif cmd=='finish':exact_assets(a);finish(a)
  else:
   e=a[int(cmd)-1];compose(e,sys.argv[2]);save(a);write_state(a);print(e['numero'],e['mot'])
