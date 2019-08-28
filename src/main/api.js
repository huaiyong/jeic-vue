function api() {
	const express = require('express')
	const appHttp = express()

	/* 定义log4j  打印请求链接url和参数  并写入文件
	https://log4js-node.github.io/log4js-node/index.html  这是官方文档
	*/
	var log4js = require('log4js');
	log4js.configure({
		appenders: {
			console: { type: 'console' },
			file: { type: 'file', filename: 'all-the-logs.log' }
		},
		categories: {
			default: { appenders: ['file','console'], level: 'info' }
		}
	});

	var logger = log4js.getLogger();
	//定义访问日志返回规范
	appHttp.use(log4js.connectLogger(logger, {
		level: 'info',
		format: (req, res, format) => format(`:remote-addr :method :url ${JSON.stringify(req.body)}`)
	}));
	//重写console.log 让他按照日志输出
	console.log = logger.info.bind(logger);

	// 设置跨域
	appHttp.all('*', (req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*')
		res.header('Access-Control-Allow-Origin', 'req.headers.origin')
		res.header('Access-Control-Allow-Headers', 'X-Requested-With')
		res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
		res.header('X-Powered-By', '3.2.1')
		res.header('Content-type', 'application/json;charset=utf-8')
		next()
	})

  	// 注册 解析表单的body-parser
	const bodyParser = require('body-parser')
	appHttp.use(bodyParser.urlencoded({extended:false}))
	appHttp.use(bodyParser.json());

	// 配置服务端口
	const server = appHttp.listen(3000, () => {
		const host = server.address().address
		const port = server.address().port
		console.log('Listen at http://%s:%s', host, port)
	})

	/**
	 * 创建socket.io连接
	*/
	const io = require('socket.io')(server);
	const chat = require("../../modules/classRoomSocket");
	chat.Start(io);

	/// 路由信息 （接口地址）开始 存放在./routes目录下 ====//
	
	var classRecord = require('./web/classRecord'); //课堂记录接口
	appHttp.use('/jeic/api/classRecord', classRecord);
	
    var answerResult = require('./web/answerResult'); //答题结果统计接口
    appHttp.use('/jeic/api/answerResult', answerResult);

	var signin = require('./web/signin'); 	//签到接口
	appHttp.use('/jeic/api/signin', signin);

    var sendRecord = require('./web/sendRecord'); //下发试题接口
    appHttp.use('/jeic/api/sendRecord', sendRecord);

	var startClass = require('./web/startClass'); //开始上课接口
    appHttp.use('/jeic/api/startClass', startClass);
    
    var userGroup = require('./web/userGroup'); //开始上课接口
    appHttp.use('/group', userGroup);//获取上课接口
 
    
    var countAnswer = require('./web/countAnswer'); //统计答题情况接口
	appHttp.use('/api', countAnswer);//获取统计答题情况接口
 
    
    var student = require('./web/student'); //学生接口
    appHttp.use('/jeic/api/student', student);
 
	var teachingGroup = require('./web/teachingGroup'); //教学组接口
    appHttp.use('/jeic/api/teachingGroup', teachingGroup);
	
    var userGroup = require('./web/userGroup'); //用户组接口
    appHttp.use('/jeic/api/userGroup', userGroup);

	var student = require('./web/student'); //学生接口
	appHttp.use('/jeic/api/student', student);

 	var studentPad = require('./web/studentPad'); //学生pad签到
	appHttp.use('/jeic/api/studentPad', studentPad);
	
	var login = require('./web/login'); //学生pad签到
	appHttp.use('/jeic/api/login', login);

 
}


module.exports = api
