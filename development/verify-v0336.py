from pathlib import Path
from html.parser import HTMLParser
from PIL import Image
import re,base64,io,zipfile
p=Path('outputs/Maths-Quest-v0.3.36-autonome.html');s=p.read_text()
class Check(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.images=[];self.scripts=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='img' and a.get('src'):self.images.append(a['src'])
c=Check();c.feed(s);assert len(c.ids)==len(set(c.ids))
js=Path('work/game-v0336.js').read_text();assert re.search(r'<script>(.*?)</script>',s,re.S)[1]==js
for id in re.findall(r"getElementById\(['\"]([^'\"]+)['\"]\)",js):assert id in c.ids,id
for m in re.finditer(r'data:image/[^;]+;base64,([A-Za-z0-9+/=]+)',s):
 im=Image.open(io.BytesIO(base64.b64decode(m[1])));im.verify()
assert len(c.images)==69,len(c.images)
assert not re.search(r'(?:src|href)=["\']https?://',s)
assert '@@MAP@@' not in s
with zipfile.ZipFile('outputs/Maths-Quest-v0.3.36.zip') as z:
 assert z.testzip() is None
 ext=z.read('index.html').decode();assert 'data:image/' not in ext
 for src in re.findall(r'(?:src=|url\()["\']?(assets/[^"\') ]+)',ext):assert src in z.namelist(),src
 assert z.read(p.name)==p.read_bytes()
 print('PASS : HTML sans ID dupliqué, tous les éléments référencés présents, 70 images intégrées valides, aucune ressource distante, ZIP intègre et autonome identique.')
