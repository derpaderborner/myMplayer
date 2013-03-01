from jsonrpclib.SimpleJSONRPCServer import SimpleJSONRPCServer,SimpleJSONRPCRequestHandler
from SimpleHTTPServer import SimpleHTTPRequestHandler
from SocketServer import ThreadingMixIn
from mplayer import MPlayer
import os,sys

mediasources = { "Serien":"/datengrab/serien/",
		"Filme":"/datengrab/filme/",
		"Audiobooks":"/datengrab/audiobooks/",
		"Music":"/datengrab/music/"}
exts = ['3gp','avi','divx','flv','m2ts','mkv','mp4','mpeg','mpg','mp3']
# 192.168.178.101	q615
# 192.168.178.105	n900
# 192.168.178.106	mbpc
# 192.168.178.107	mbtp
allowed_ips = ['127.0.0.1','192.168.178.101','192.168.178.105','192.168.178.106','192.168.178.107']

class MyRequestHandler(SimpleJSONRPCRequestHandler,SimpleHTTPRequestHandler):
	def do_POST(self):
		if self.client_address[0] not in allowed_ips:
			self.send_error(403,"Your address is not in allowed_ips")
			return
		SimpleJSONRPCRequestHandler.do_POST(self)

class ThreadedJSONRPCServer(ThreadingMixIn,SimpleJSONRPCServer): pass

def ls(path=''):
	if len(path)==0:
		return {"dirs":mediasources.keys()}
	p=path.split('/')
	path=mediasources[p[0]]+'/'.join(p[1:])
	try:
		d=os.listdir(path)
	except OSError:
		return "'%s' not found"%path

	dirs = []
	files = []
	for f in d:
		name,ext=os.path.splitext(f)
		if len(ext)==0 and os.path.isdir(path+'/'+name):
			dirs.append(f)
		elif ext[1:] in exts:
			files.append(f)
	dirs.sort()
	files.sort()
	return {"dirs":dirs,"files":files}

def mfile(method,*args):
	t=[]
	for arg in args:
		if type(arg) in (str,unicode):
			p=arg.split('/')
			if p[0] in mediasources.keys():
				t.append(mediasources[p[0]]+'/'.join(p[1:]))
		else:
			t.append(arg)
	try:
		return getattr(mp,method)(*t)
	except AttributeError:
		return "'%s' not found"%method

ip = sys.argv[1] if len(sys.argv)>1 else "192.168.178.106"
port =  int(sys.argv[2]) if len(sys.argv)>2 else 1337

srv = SimpleJSONRPCServer((ip, port),MyRequestHandler)

MPlayer.populate()
mp = MPlayer()
srv.register_instance(mp)

srv.register_function(ls)
srv.register_function(mfile)
print "Starting Server on %s:%s"%(ip,port)
srv.serve_forever()

