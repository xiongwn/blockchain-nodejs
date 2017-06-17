var express=require("express");
var apprsa=require('./apprsa')
var sha_1=require('./sha_1')
var fs=require('fs')
var mongoose =require("mongoose");
var app= express()
var server=app.listen(3000);

var io=require("socket.io").listen(server);
var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter(); 
var bodyParser=require("body-parser")
let date=new Date().getTime();
let verifyname=''
let alluersarr=[]
var usersobj={};//存储用户名用的，至于你要问为什么是对象而不是数组：因为数组制定对象删除太麻烦了呀sb
var userscount=0;//当前在线登录用户，不是socket的数量
var socketarr=[];//记录socket.id的数组
var sockets=[]//指定用户
mongoose.Promise=global.Promise;
var Schema=mongoose.Schema;
mongoose.connect("mongodb://verso:123@127.0.0.1:27017/test")
var monschema=new Schema({
	name:{type:String},
	pwd:{type:String}
})

function rnd( seed ){
    seed = ( seed * 9301 + 49297 ) % 233280; //为何使用这三个数?
    return seed / ( 233280.0 );
};

function rand(number){
    today = new Date(); 
    seed = today.getTime();
    return Math.ceil( rnd( seed ) * number );
};
let blocks=[{head:{hash:sha_1(JSON.stringify({ name: 'God',course:'玄学',time: 1487905671634,how_long:100})),lasthash:'0000000000000000000000000000001',version:'v1.0.0',time: 1487905671634,rand:rand(Math.pow(2,53))},body:{ name: 'God',course:'玄学',how_long:100,time: 1487905671634}}]
let allblocks=[];
//当用户数和用户上传的区块数目相同时进行区块比对，区块都相等则将新交易压进区块并保存
event.on('check',function(name){
	if(allblocks.length===userscount)
	{
		let istrue=true
		for(let i=0;i<allblocks.length-1;i++)
		{
			//console.log('一个：'+JSON.stringify(allblocks[i]['blocks'])+'另一个：'+JSON.stringify(allblocks[i+1]['blocks']))
			
			if(JSON.stringify(allblocks[i]['blocks'])!==JSON.stringify(allblocks[i+1]['blocks']))
				{
					istrue=false;
					console.log('区块验证错误：有用户私自篡改区块数据')
				}

		}
		if(istrue)
		{
			let arr=[]
			for(let value of allblocks[0].blocks)
			{
				if(value['body']['name']===name)
				{
					arr.push(value)
				}
			}
			sockets[0].emit('yours',arr)
			sockets=[]
		}
		else
		{
			event.emit('wrong');
			return;
		}
		//console.log('allblocks: ',allblocks)
		event.emit('checked',blocks)
		allblocks=[]
	}
})
event.on('update',function(obj){
	blocks.push(obj);
	event.emit('checked',blocks)
	
})
//防抖动函数
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        }, wait);
        if (immediate && !timeout) func.apply(context, args);
    };
};
app.use(bodyParser.urlencoded({ extended: false }));
//请求资源的，没啥好说的
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
	});
	//表单验证
app.post("/signup",function(req,res){
	let obj=req.body;
	let model=mongoose.model("user",monschema)
	model.find({name:obj.name},function(err,result){
		if(err)
			{
				console.log(err)
			}
		else
		{
			if(result.length===0)
			{
				let insert=new model({name:obj.name,pwd:obj.pwd})
				insert.save(function(err){
					if(err)
					{
						console.log(err)
					}
					else
					{
						console.log("注册成功")
						res.send("注册成功")
						return;
					}
				})
			}
			else
			{
				console.log("用户名已存在")
				res.redirect(301,"/signup.html")
				res.send("用户名已存在")
				
			}
		}
	})
	//res.sendStatus(200)
})


//请求资源的，没啥好说的
app.get("/css/demo.css",function(req,res){
	res.sendFile(__dirname+"/css/demo.css")
})
app.get("/css/style.css",function(req,res){
	res.sendFile(__dirname+"/css/style.css")
})
app.get("/images/bg.jpg",function(req,res){
	res.sendFile(__dirname+"/images/bg.jpg")
})
app.get("/css/animate-custom.css",function(req,res){
	res.sendFile(__dirname+"/css/animate-custom.css")
})
app.get("/signup.html",function(req,res){
	res.sendFile(__dirname+"/signup.html")
})
app.get('/rsa/jsbn.js',function(req,res){
	res.sendFile(__dirname+'/rsa/jsbn.js')

})
app.get('/rsa/jsbn2.js',function(req,res){
	res.sendFile(__dirname+'/rsa/jsbn2.js')
})
app.get('/rsa/prng4.js',function(req,res){
	res.sendFile(__dirname+'/rsa/prng4.js')
})
app.get('/rsa/rng.js',function(req,res){
	res.sendFile(__dirname+'/rsa/rng.js')
})
app.get('/rsa/rsa.js',function(req,res){
	res.sendFile(__dirname+'/rsa/rsa.js')
})
app.get('/rsa/rsa2.js',function(req,res){
	res.sendFile(__dirname+'/rsa/rsa2.js')
})
app.get('/jquery.js',function(req,res){
	res.sendFile(__dirname+'/jquery.js');
});
//请求资源的，没啥好说的
app.get('/socket.io.js',function(req,res){
	res.sendFile(__dirname+'/socket.io.js');
});
app.get('/bootstrap3/css/bootstrap.css',function(req,res){
	res.sendFile(__dirname+'/bootstrap3/css/bootstrap.css')
})
app.get('/assets/css/gsdk.css',function(req,res){
	res.sendFile(__dirname+'/assets/css/gsdk.css')
})
app.get('/assets/css/demo.css',function(req,res){
	res.sendFile(__dirname+'/assets/css/demo.css')
})
app.get('/bootstrap3/css/font-awesome.css',function(req,res){
	res.sendFile(__dirname+'/bootstrap3/css/font-awesome.css')
})
app.get('/assets/img/new_logo.png',function(req,res){
	res.sendFile(__dirname+'/assets/img/new_logo.png')
})
app.get('/assets/img/cover_4.jpg',function(req,res){
	res.sendFile(__dirname+'/assets/img/cover_4.jpg')
})
app.get('/assets/img/cover_4_blur.jpg',function(req,res){
	res.sendFile(__dirname+'/assets/img/cover_4_blur.jpg')
})
app.get('/bootstrap3/css/bootstrap.css',function(req,res){
	res.sendFile(__dirname+'/bootstrap3/css/bootstrap.css')
})
app.get('/assets/css/gsdk.css',function(req,res){
	res.sendFile(__dirname+'/assets/css/gsdk.css')
})
app.get('/assets/css/demo.css',function(req,res){
	res.sendFile(__dirname+'/assets/css/demo.css')
})
app.get('/bootstrap3/css/font-awesome.css',function(req,res){
	res.sendFile(__dirname+'/bootstrap3/css/font-awesome.css')
})
app.get('/bootstrap.js',function(req,res){
	res.sendFile(__dirname+'/bootstrap.js')
})
event.on('checked',function(blocks){
			io.sockets.emit('save_new',blocks)
			//io.sockets.broadcast.emit('save_new',blocks)
			
		})
event.on('wrong',function(){
	io.sockets.emit('wrong')
})

io.sockets.on('connection', function (socket) {

	socketarr.push(socket.id);//连接上的时候把socket.id压入数组

//测试用的
let own_obj={};
	socket.emit('news', {'socketarr':socketarr});
	socket.on('other event', function (data) {
		console.log(data);
	});
	//有人想申请证书啦，他或她发送来一个请求，内容是发送时的时间戳
	socket.on('verification',function(){

		verifyname=socket.name;
		socket.emit('verification_1')
		// socket.broadcast.emit('quanbudequkuailian');
		// socket.emit('quanbudequkuailian')
	})
	let hashsocket=[]
	socket.on("hashcheck",function(hash){
		hashsocket.push(socket);
		socket.broadcast.emit("quanbudequkuailian_1");
		socket.emit("quanbudequkuailian_1");
	})
	var chayuename=''
	
	socket.on('chayue',function(username){
		verifyname=socket.name;
		chayuename=username
		socket.broadcast.emit('quanbudequkuailian');
		socket.emit('quanbudequkuailian')
		sockets.push(socket)
	})
	//rsa验证，比较重要
	socket.on('verification_2_head',function(obj_head){
		
		
		if(apprsa(obj_head))
		{own_obj.head=JSON.parse(apprsa(obj_head))}
		
		//
	})
	socket.on('verification_2_head_1',function(obj_head_1){
		let obj={},str='';
		if(str=apprsa(obj_head_1))
		{
			obj=JSON.parse(str)
			let keysarr=Object.keys(obj)
			for(let i=0;i<keysarr.length;i++)
			{
				own_obj.head[keysarr[i]]=obj[keysarr[i]]
			}
			
		}
	})
	socket.on('verification_2_body',function(obj_body){
			if(apprsa(obj_body))
		{
			own_obj.body=JSON.parse(apprsa(obj_body))}
			if(own_obj.body&&own_obj.head)
			{
				event.emit('update',own_obj)
		        own_obj={}
	        }
		})

	socket.on("uploadmine_1",function(e){

		let personal={'blocks':e.blockchain}
		allblocks.push(personal);
		console.log(allblocks.length+""+userscount)
		if(allblocks.length===userscount)
		{
			console.log(allblocks)
			hashsocket.pop().emit("allblocks",allblocks)
		}
		allblocks=[];
	})
	//上传各自的文件内容
	socket.on('uploadmine',function(e){
		let now=new Date().getTime();
		//let obj={'name':verifyname}
		// let str=e.split('=')[1]
		// let arr=JSON.parse(str)
		//console.log(e.blockchain)
		let personal={'name':socket.name,'blocks':e.blockchain}
		allblocks.push(personal);
		
		/*while(allblocks.length<userscount)
		{
console.log("ss")
		}*/
		if(allblocks.length===userscount)
		{
			event.emit('check',chayuename)
		}
		/*event.on('checked',function(blocks){
			socket.emit('save_new',blocks)
			socket.broadcast.emit('save_new',blocks)
		})*/
	});
	//测试大家能不能彼此通讯
	socket.on('message',function(data){
		if(socket.name)
		{
			socket.broadcast.emit('broadcast',socket.name + ': ' + data);
		}
		else
		{
			socket.emit('console','请先登录')
		}
	});
	//点击登录按钮，传过来用户名
	socket.on('login',function(data){
		let cachename=data.name //记录用户名
		let pwd=data.pwd;//密码
		let model=mongoose.model("user",monschema);
		model.find({name:cachename,pwd:pwd},function(err,result){
			if(err)
			{
				console.log(err)
				return;
			}
			else
			{
				if(result.length!==0)
				{
					console.log(result)
					socket.emit('ymy',blocks)//看看用户有没有区块
		if(usersobj[cachename]===undefined)//对象中如果没有该用户则加入对象
		{
			usersobj[cachename]=cachename
			socket.name=cachename;
			userscount++;
			console.log("usersobj: "+usersobj+"  userscount: "+userscount)
			socket.emit('logined')

			for(let value of alluersarr)
			{
				if(value['name']===cachename)
				{
					break ;
				}
			}
			let obj={"name":cachename,'tag':1}
			alluersarr.push(obj)
		}
			else {
				socket.emit('alert',"该用户名已经注册")
			}
			socket.emit('console',{'usersobj':usersobj,'userscount':userscount})
				}
				else
				{
					socket.emit("usermessageerr")
					console.log("用户名不存在或信息错误")
					return ;
				}
			}
		})
		
		})
	//断连之后的事件处理
	socket.on('disconnect',function(){
		for(let i=0;i<socketarr.length;i++)
		{
			if(socketarr[i]===socket.id)
			{
				socketarr.splice(i,1);
			}
		}
		socket.broadcast.emit('console',{'usersobj':usersobj,'userscount':userscount,'socketarr':socketarr})
		if(usersobj[socket.name]){
			delete usersobj[socket.name];
			userscount--;
			console.log("usersobj: "+usersobj+"  userscount: "+userscount);
			socket.emit('console',{'usersobj':usersobj,'userscount':userscount,'socketarr':socketarr})
		}
	})
});