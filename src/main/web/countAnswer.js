var express = require('express');
var router = express.Router();
const countAnswerdb = require('../db/countAnswerdb');
/*全班教學模式下 根據下發記錄Id 查詢 答題詳情  
分組教學模式下組長作答  根據下發記錄Id 查詢每一個小組的 答題詳情 （每一個組長的情況）*/
router.get('/getDataGroupByUser', function(req, res) {
	var type=req.param('type')
	var resultMap = {}
	var dataMap = {}
	var notTheAnswerCount = 0;
	var haveTheAnswerCount = 0;
	var answerResultList = [];
	if(type == 1) { //全班教學模式
		countAnswerdb.getDataGroupByUser(req,function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					var stuMap = {};
					stuMap["realname"] = answer.realname; //學生名稱
					stuMap["Count"] = answer.Count; //總統計
					stuMap["trueCount"] = answer.trueCount; //正確統計
					stuMap["falseCount"] = answer.falseCount //錯誤統計
					stuMap["userId"] = answer.userId; //學生Id；
					console.log("學生名稱》》" + answer.realname);
					if(answer.answer == null || answer.answer == '') {
						notTheAnswerCount++;
					} else {
						haveTheAnswerCount++;
					}
					stuMap["accuracy"] = stuMap["trueCount"] / stuMap["Count"];
					answerResultList.push(stuMap);
				}
				resultMap["notTheAnswerCount"] = notTheAnswerCount; //未答題人數
				resultMap["haveTheAnswerCount"] = haveTheAnswerCount;
			}
			resultMap["answerResultList"] = answerResultList;
			res.json({
				data: resultMap,
				message: "全班教學模式下 查詢答題情況詳情",
				ret: 200
			})
		});

	} else if(type == 2) {//分組教學 組長作答
		countAnswerdb.getDataGroupByUser(req, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					var stuMap = {};
					stuMap["usergroupName"] = answer.usergroupName; //學生名稱
					stuMap["Count"] = answer.Count; //總統計
					stuMap["trueCount"] = answer.trueCount; //正確統計
					stuMap["falseCount"] = answer.falseCount //錯誤統計
					stuMap["usergroupId"] = answer.usergroupId; //小組Id；
					stuMap["userName"]=answer.userName;
					stuMap["userId"]=answer.userId;
					if(answer.answer == null || answer.answer == '') {
						console.log("未答題人數》》" + notTheAnswerCount);
						notTheAnswerCount++;
					} else {
						haveTheAnswerCount++;
					}
					stuMap["accuracy"] = stuMap["trueCount"] / stuMap["Count"];
					answerResultList.push(stuMap);
				}
				resultMap["notTheAnswerCount"] = notTheAnswerCount;
				resultMap["haveTheAnswerCount"] = haveTheAnswerCount;
			}
			resultMap["answerResultList"] = answerResultList;
			res.json({
				data: resultMap,
				message: "分組教學模式下 組長作答 查詢答題情況詳情",
				ret: 200
			})
		});
	} else if(type == 3) { //分組教學模式下 全組作答 單組的正確率
		countAnswerdb.getDataGroupByUser(req, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					var stuMap = {};
					stuMap["studentName"] = answer.studentName; //學生名稱
					stuMap["Count"] = answer.Count; //總統計
					stuMap["trueCount"] = answer.trueCount; //正確統計
					stuMap["falseCount"] = answer.falseCount //錯誤統計
					stuMap["usergroupName"] = answer.usergroupName; //小組名稱；
					stuMap["usergroupId"]=answer.usergroupId;
					stuMap["userName"]=answer.userName;
					stuMap["userId"]=answer.userId;
					console.log("小組"+answer.usergroupName);
					if(answer.answer == null || answer.answer == '') {
						notTheAnswerCount++;
					} else {
						haveTheAnswerCount++;
					}
					stuMap["accuracy"] = stuMap["trueCount"] / stuMap["Count"];
					answerResultList.push(stuMap);
				}
				resultMap["notTheAnswerCount"] = notTheAnswerCount;
				resultMap["haveTheAnswerCount"] = haveTheAnswerCount;
			}
			resultMap["answerResultList"] = answerResultList;
			res.json({
				data: resultMap,
				message: "分組教學模式下 全組作答 單組的正確率",
				ret: 200
			})
		});
	}
});

//統計答題平均正確率 
router.get('/getavgeByRecordId', function(req, res) {
	var recordId = req.param('recordId');
	var usergroupId = req.param('usergroupId');
	var type = req.param('type');
	var resultMap = {};
	if(type == 1) { //全班教學模式
		countAnswerdb.getavgeByRecordId(recordId, type, usergroupId, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					resultMap["Count"] = answer.Count; //總統計
					resultMap["trueCount"] = answer.trueCount; //正確人數
					resultMap["notTheAnswerCount"] = answer.nothaveTheAnswerCount; //未答題人數
					resultMap["haveTheAnswerCount"] = answer.haveTheAnswerCount; //已答題人數
					resultMap["accuary"] = resultMap["trueCount"] / resultMap["Count"];
				}
			}
			res.json({
				data: resultMap,
				message: "全班教學模式下 答題答題   平均正確率  已答題未答題人數",
				ret: 200
			})
		})
	} else if(type == 2) { //分組教學模式 組長作答
		countAnswerdb.getavgeByRecordId(recordId, type, usergroupId, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					resultMap["Count"] = answer.Count; //總統計
					resultMap["trueCount"] = answer.trueCount; //正確人數
					resultMap["notTheAnswerCount"] = answer.nothaveTheAnswerCount; //未答題人數
					resultMap["haveTheAnswerCount"] = answer.haveTheAnswerCount; //已答題人數
					resultMap["accuary"] = resultMap["trueCount"] / resultMap["Count"];
				}
			}
			res.json({
				data: resultMap,
				message: "分組教學模式下  組長答題答題   平均正確率  已答題未答題人數",
				ret: 200
			})
		})
	} else if(type == 3) { //分組教學模式下  全組答題平均正確率
		countAnswerdb.getavgeByRecordId(recordId, type, usergroupId, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					resultMap["Count"] = answer.Count; //總統計
					resultMap["trueCount"] = answer.trueCount; //正確人數
					resultMap["notTheAnswerCount"] = answer.nothaveTheAnswerCount; //未答題人數
					resultMap["haveTheAnswerCount"] = answer.haveTheAnswerCount; //已答題人數
					resultMap["accuary"] = resultMap["trueCount"] / resultMap["Count"];
				}
			}
			res.json({
				data: resultMap,
				message: "分組教學模式 全組作答 答題   平均正確率  已答題未答題人數",
				ret: 200
			})
		})
	}
});

// 查看單題選項答題情況    
//router.get('/getDataByQuestionId', function(req, res) {
//	var dataMap = {};
//	var recordId = req.param('recordId');
//	var datamark = req.param('datamark');
//	var grouparray = new Array();
//	var usergroupId = req.param('usergroupId');
//	var stuArray = new Array();
//	var type = req.param('type');
//	if(type == 1) { // 全班教學模式下 查看單題的答題情況
//		countAnswerdb.getDataByQuestionId(recordId, type, datamark, usergroupId, function(rows) {
//			var optionInfo = {};
//			var stuAnswerOptionList = ["optionA", "optionB", "optionC", "optionD", "optionE", "optionF", "optionG", "optionH", "optionI", "optionJ"];
//			var stuAnswerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
//			var userListOption =  [];//保存 統計的每個選項的  學生列表 
//			var optionsMap={}
//			var count = 0;
//			var trueCount = 0; // 正确统计
//			var falseCount = 0; // 错误统计
//			var nullCount = 0; // 空值统计
//			var countYES = 0;
//			var countNO = 0;
//			var userListOptionYES = []; //選YES的學生集合
//			var userListOptionNO = []; //選NO的學生集合
//			var userListOptionUnknown = []; //未答題的學生集合
//			var optionYES = {}; //統計選擇YES的學生數
//			var optionNO = {};; //統計選擇NO的學生數
//			var optionUnknown = {}; //統計未答題的學生數
//			var optionNu = 0;
//			var countUnknown = 0; //未答題統計
//			if(rows.length > 0) {
//				for(var answer of rows) {
//					var stuMap = {};
//					stuMap["realname"] = answer.realname; //學生名；
//					stuMap["userId"] = answer.user_id;
//					stuMap["result"] = answer.result; //答題結果
//					stuMap["deviceId"] = answer.device_id; //設備號
//					stuMap["datamark"] = datamark; //題號
//					stuMap["answer"] = answer.answer; //學生答案
//					stuMap["trueAnswer"] = answer.true_answer; //正確答案;
//					stuMap["score"] = answer.score; //分數
//					var optionNumber = answer.option_number //選項個數
//					//					var stuArray=new Array(optionNumber);
//					optionNu = answer.option_number; //選項個數
//					var type = answer.type; //題型
//					
//				 else if(type === "2") { //選擇題 單選 
//		 
//						} else {
//							countUnknown++;
//							userListOptionUnknown.push(groupMap);
//						}
//
//					} else if(type === "4") {}
//				}
//				 
//				res.json({
//					data: dataMap,
//					message: "全班教學模式 全班作答 查看單個題的答題情況",
//					ret: 200
//				})
//
//			}
//		});
//
//	} else if(type == 2) {} else if(type == 3) {}
//});

router.get('/getDataByQuestionId', function(req, res) {
	var dataMap = {};
	var recordId = req.param('recordId');
	var datamark = req.param('datamark');
	var grouparray = new Array();
	var usergroupId = req.param('usergroupId');
	var stuArray = new Array();
	var type = req.param('type');
	if(type == 1) { // 全班教學模式下 查看單題的答題情況
		countAnswerdb.getDataByQuestionId(recordId, type, datamark, usergroupId, function(rows) {
			var optionList = {};
			var optionInfo = {};
			var stuAnswerOptionList = ["optionA", "optionB", "optionC", "optionD", "optionE", "optionF", "optionG", "optionH", "optionI", "optionJ"];
			var numberofOptions = [] //選項個數
			var stuAnswerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
			var trueCount = 0; // 正确统计
			var falseCount = 0; // 错误统计
			var nullCount = 0; // 空值统计
			var countYES = 0;
			var countNO = 0;
			var userListOptionYES = []; //選YES的學生集合
			var userListOptionNO = []; //選NO的學生集合
			var userListOptionUnknown = []; //未答題的學生集合
			var optionYES = {}; //統計選擇YES的學生數
			var optionNO = {}; //統計選擇NO的學生數
			var optionUnknown = {}; //統計未答題的學生數
			if(rows.length > 0) {
				var type = rows[0].type; //題型
				var optionNumber = rows[0].option_number //選項個數
				var score = rows[0].score //選項個數
				var nullCount = 0; // 空值统计
				var countUnknown = 0; //未答題統計
				if(type == 1) { // 判斷題   判 斷當前題的題型  1 判斷題 2 單選  4 多選
					for(var answer of rows) {
						var stuMap = {};
						stuMap["realname"] = answer.realname; //學生名；
						stuMap["userId"] = answer.user_id;
						stuMap["result"] = answer.result; //答題結果
						stuMap["deviceId"] = answer.device_id; //設備號
						stuMap["datamark"] = datamark; //題號
						stuMap["answer"] = answer.answer; //學生答案
						stuMap["trueAnswer"] = answer.true_answer; //正確答案;
						stuMap["score"] = answer.score; //分數
						if(answer.answer === "YES") {
							countYES++;
							userListOptionYES.push(stuMap);
						} else if(answer.answer === "NO") {
							countNO++;
							userListOptionNO.push(stuMap);
						} else {
							countUnknown++;
							userListOptionUnknown.push(stuMap);
						}
						if(answer.result == 1) { //答對統計
							trueCount++; // 正确统计
							score = answer.score //分數
						} else if(answer.result == 0) { //答錯統計
							falseCount++; // 错误统计
						} else {
							nullCount++;
						}
					}
					optionYES["count"] = countYES;
					optionYES["userList"] = userListOptionYES;
					optionNO["count"] = countNO;
					optionNO["userList"] = userListOptionNO;
					optionUnknown["count"] = countUnknown;
					optionUnknown["userList"] = userListOptionUnknown;
					optionInfo["optionYES"] = optionYES;
					optionInfo["optionNO"] = optionNO;
					optionInfo["optionUnknown"] = optionUnknown;
				} else if(type == 2) { //單選題
					for(var i = 0; i < optionNumber; i++) {
						var userList = [];
						var optionMap = {};
						var optionUnknownMap = {};
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						for(var answer of rows) {
							var stuMap = {};
							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer === stuAnswerList[i]) {
								count++;
								userList.push(stuMap);
							}
							if(answer.result == 1) { //答對統計
								trueCount++; // 正确统计
								score = answer.score //分數
							} else if(answer.result == 0) { //答錯統計

								falseCount++; // 错误统计
							}
							if(answer.answer == null || answer.answer == '') { //未答題個數
								if(i==0){
									nullCount++;
									countUnknown++;
									userListOptionUnknown.push(stuMap);
								}
							}
						}
						optionMap["count"] = count;
						optionMap["userList"] = userList;
						optionInfo[stuAnswerOptionList[i]] = optionMap;

					}
					optionUnknownMap["count"] = countUnknown;
					optionUnknownMap["userList"] = userListOptionUnknown;
					optionInfo["optionUnknown"] = optionUnknownMap;

				} else if(type == 4) { //   4 多選 
					for(var i = 0; i < optionNumber; i++) {
						var userList = [];
						var userMap = {};
						var optionUnknownMap = {};
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						for(var answer of rows) {
							var stuMap = {};
							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer == null || answer.answer == '') { //未答題個數
								if(i==0){
									nullCount++;
									countUnknown++;
									userListOptionUnknown.push(stuMap);
								}
							}else {
								if(answer.answer.search(stuAnswerList[i]) != -1) {
									count++;
									userList.push(stuMap);
								}
								if(answer.result == 1) { //答對統計
									trueCount++; // 正确统计
									score = answer.score //分數
								} else if(answer.result == 0) { //答錯統計
									falseCount++; // 错误统计
								}
							}
							
							
						}
						userMap["count" + stuAnswerList[i]] = count;
						userMap["userList"] = userList;
						optionInfo[stuAnswerOptionList[i]] = userMap;
					}
					optionUnknownMap["count"] = countUnknown;
					optionUnknownMap["userList"] = userListOptionUnknown;
					optionInfo["optionUnknown"] = optionUnknownMap;
				}

			}
			dataMap["trueCount"] = trueCount,
			dataMap["falseCount"] = falseCount,
			dataMap["nullCount"] = nullCount,
			dataMap["optionInfo"] = optionInfo;
			dataMap["optionNu"] = optionNumber;
			dataMap["score"] = score;
			dataMap["type"] = type;
			res.json({
				data: dataMap,
				message: "全班教學模式 全班作答 查看單個題的答題情況",
				ret: 200
			})

		});
	} else if(type == 2) { //分組教學模式 組長作答
		countAnswerdb.getDataByQuestionId(recordId, type, datamark, usergroupId, function(rows) {
			var optionInfo = {};
			var stuAnswerOptionList = ["optionA", "optionB", "optionC", "optionD", "optionE", "optionF", "optionG", "optionH", "optionI", "optionJ"];
			var numberofOptions = [] //選項個數
			var stuAnswerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
			var trueCount = 0; // 正确统计
			var falseCount = 0; // 错误统计
			var nullCount = 0; // 空值统计
			var countYES = 0;
			var countNO = 0;
			var userListOptionYES = []; //選YES的學生集合
			var userListOptionNO = []; //選NO的學生集合
			var userListOptionUnknown = []; //未答題的學生集合
			var optionYES = {}; //統計選擇YES的學生數
			var optionNO = {}; //統計選擇NO的學生數
			var optionUnknown = {}; //統計未答題的學生數
			if(rows.length > 0) {
				var type = rows[0].type; //題型
				var optionNumber = rows[0].option_number //選項個數
				var answer1 = rows[0].answer; //學生答案
				var nullCount = 0; // 空值统计
				var countUnknown = 0; //未答題統計
				if(type == 1) { // 判斷題   判 斷當前題的題型  1 判斷題  4 多選
					for(var answer of rows) {
						var stuMap = {};
						var optionMap = {};
						var userList = [];
						stuMap["realname"] = answer.realname; //學生名；
						stuMap["userId"] = answer.user_id;
						stuMap["result"] = answer.result; //答題結果
						stuMap["deviceId"] = answer.device_id; //設備號
						stuMap["datamark"] = datamark; //題號
						stuMap["answer"] = answer.answer; //學生答案
						stuMap["trueAnswer"] = answer.true_answer; //正確答案;
						stuMap["score"] = answer.score; //分數
						if(answer.answer === "YES") {
							countYES++;
							userList.push(stuMap);
							optionMap["userGroupName"] = answer.name; //小組名稱
							optionMap["userGroupId"] = answer.usergroup_id; //小組ID
							optionMap["userList"] = userList;
							optionYES["countYES"] = countYES;
							userListOptionYES.push(optionMap);
							optionYES["userListOptionYES"] = userListOptionYES;
						} else if(answer.answer === "NO") {
							countNO++;
							userList.push(stuMap);
							optionMap["userGroupName"] = answer.name; //小組名稱
							optionMap["userGroupId"] = answer.usergroup_id; //小組ID
							optionMap["userList"] = userList;
							optionNO["countNO"] = countNO;
							userListOptionNO.push(optionMap);
							optionNO["userListOptionYES"] = userListOptionNO;
						} else {
							countUnknown++;
							userList.push(stuMap);
						}
						if(answer.result == 1) { //答對統計
							trueCount++; // 正确统计
							score = answer.score //分數
						} else if(answer.result == 0) { //答錯統計
							falseCount++; // 错误统计
						} else {
							nullCount++;
						}

					}
					optionInfo["optionYES"] = optionYES;
					optionInfo["optionNO"] = optionNO;
					dataMap["trueCount"] = trueCount,
						dataMap["falseCount"] = falseCount,
						dataMap["nullCount"] = nullCount,
						dataMap["optionInfo"] = optionInfo;
					dataMap["countUnknown"] = countUnknown;
					dataMap["userListOptionUnknown"] = userListOptionUnknown;
					res.json({
						data: dataMap,
						message: "分組教學模式 組長作答 查看單個題的答題情況",
						ret: 200
					})

				} else if(type == 2) { //單選題
					for(var i = 0; i < optionNumber; i++) {
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						var userListOptionList = [];
						for(var answer of rows) {
							var userList = [];
							var userMap = {};
							var stuMap = {};

							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer === stuAnswerList[i]) {
								count++;
								userList.push(stuMap);
								//								userMap["count" + stuAnswerList[i]] = count;
								userMap["userGroupId"] = answer.usergroup_id;
								userMap["userGroupName"] = answer.name;
								userMap["userList"] = userList;
								userListOptionList.push(userMap)
								optionInfo["count" + stuAnswerList[i]] = count;
							}

							if(answer.result == 1) { //答對統計
								trueCount++; // 正确统计
								score = answer.score //分數
							} else if(answer.result == 0) { //答錯統計

								falseCount++; // 错误统计
							}
							if(answer.answer == null || answer.answer == '') { //未答題個數
								nullCount++;
								countUnknown++;
								userListOptionUnknown.push(stuMap);
							}
						}
						optionInfo[stuAnswerOptionList[i]] = userListOptionList;
					}

				} else if(type == 4) { //多選題
					for(var i = 0; i < optionNumber; i++) {
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						var userListOptionList = [];
						for(var answer of rows) {
							var userList = [];
							var userMap = {};
							var stuMap = {};

							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer.search(stuAnswerList[i]) != -1) {
								count++;
								userList.push(stuMap);
								//								userMap["count" + stuAnswerList[i]] = count;
								userMap["userGroupId"] = answer.usergroup_id;
								userMap["userGroupName"] = answer.name;
								userMap["userList"] = userList;
								userListOptionList.push(userMap)
								optionInfo["count" + stuAnswerList[i]] = count;
							}

							if(answer.result == 1) { //答對統計
								trueCount++; // 正确统计
								score = answer.score //分數
							} else if(answer.result == 0) { //答錯統計

								falseCount++; // 错误统计
							}
							if(answer.answer == null || answer.answer == '') { //未答題個數
								nullCount++;
								countUnknown++;
								userListOptionUnknown.push(stuMap);
							}
						}
						optionInfo[stuAnswerOptionList[i]] = userListOptionList;
					}

				}

			}

			dataMap["trueCount"] = trueCount,
				dataMap["falseCount"] = falseCount,
				dataMap["nullCount"] = nullCount,
				dataMap["optionInfo"] = optionInfo;
			dataMap["countUnknown"] = countUnknown;
			dataMap["userListOptionUnknown"] = userListOptionUnknown;
			res.json({
				data: dataMap,
				message: "分組教學模式 全班作答 查看單個題的答題情況",
				ret: 200
			})
		});

	} else if(type == 3) { //分組教學模式 全組作答 
		countAnswerdb.getDataByQuestionId(recordId, type, datamark, usergroupId, function(rows) {
			var optionInfo = {};
			var stuAnswerOptionList = ["optionA", "optionB", "optionC", "optionD", "optionE", "optionF", "optionG", "optionH", "optionI", "optionJ"];
			var numberofOptions = [] //選項個數
			var stuAnswerList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
			var trueCount = 0; // 正确统计
			var falseCount = 0; // 错误统计
			var nullCount = 0; // 空值统计
			var countYES = 0;
			var countNO = 0;
			var userListOptionYES = []; //選YES的學生集合
			var userListOptionNO = []; //選NO的學生集合
			var userListOptionUnknown = []; //未答題的學生集合
			var optionYES = {}; //統計選擇YES的學生數
			var optionNO = {}; //統計選擇NO的學生數
			var optionUnknown = {}; //統計未答題的學生數
			if(rows.length > 0) {
				var type = rows[0].type; //題型
				var optionNumber = rows[0].option_number //選項個數
				var answer1 = rows[0].answer; //學生答案
				var nullCount = 0; // 空值统计
				var countUnknown = 0; //未答題統計
				if(type == 1) { // 判斷題   判 斷當前題的題型  1 判斷題  4 多選
					for(var answer of rows) {
						var stuMap = {};
						var optionMap = {};
						var userList = [];
						stuMap["realname"] = answer.realname; //學生名；
						stuMap["userId"] = answer.user_id;
						stuMap["result"] = answer.result; //答題結果
						stuMap["deviceId"] = answer.device_id; //設備號
						stuMap["datamark"] = datamark; //題號
						stuMap["answer"] = answer.answer; //學生答案
						stuMap["trueAnswer"] = answer.true_answer; //正確答案;
						stuMap["score"] = answer.score; //分數
						if(answer.answer === "YES") {
							countYES++;
							userList.push(stuMap);
							optionMap["userGroupName"] = answer.name; //小組名稱
							optionMap["userGroupId"] = answer.usergroup_id; //小組ID
							optionMap["userList"] = userList;
							optionYES["countYES"] = countYES;
							userListOptionYES.push(optionMap);
							optionYES["userListOptionYES"] = userListOptionYES;
						} else if(answer.answer === "NO") {
							countNO++;
							userList.push(stuMap);
							optionMap["userGroupName"] = answer.name; //小組名稱
							optionMap["userGroupId"] = answer.usergroup_id; //小組ID
							optionMap["userList"] = userList;
							optionNO["countNO"] = countNO;
							userListOptionNO.push(optionMap);
							optionNO["userListOptionYES"] = userListOptionNO;
						} else {
							countUnknown++;
							userList.push(stuMap);
						}
						if(answer.result == 1) { //答對統計
							trueCount++; // 正确统计
							score = answer.score //分數
						} else if(answer.result == 0) { //答錯統計
							falseCount++; // 错误统计
						} else {
							nullCount++;
						}

					}
					optionInfo["optionYES"] = optionYES;
					optionInfo["optionNO"] = optionNO;
					dataMap["trueCount"] = trueCount,
						dataMap["falseCount"] = falseCount,
						dataMap["nullCount"] = nullCount,
						dataMap["optionInfo"] = optionInfo;
					dataMap["countUnknown"] = countUnknown;
					dataMap["userListOptionUnknown"] = userListOptionUnknown;
					res.json({
						data: dataMap,
						message: "分組教學模式 組長作答 查看單個題的答題情況",
						ret: 200
					})

				} else if(type == 2) { //單選題
					for(var i = 0; i < optionNumber; i++) {
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						var userListOptionList = [];
						for(var answer of rows) {
							var userList = [];
							var userMap = {};
							var stuMap = {};

							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer === stuAnswerList[i]) {
								count++;
								userList.push(stuMap);
								//								userMap["count" + stuAnswerList[i]] = count;
								userMap["userGroupId"] = answer.usergroup_id;
								userMap["userGroupName"] = answer.name;
								userMap["userList"] = userList;
								userListOptionList.push(userMap)
								optionInfo["count" + stuAnswerList[i]] = count;
							}

							if(answer.result == 1) { //答對統計
								trueCount++; // 正确统计
								score = answer.score //分數
							} else if(answer.result == 0) { //答錯統計

								falseCount++; // 错误统计
							}
							if(answer.answer == null || answer.answer == '') { //未答題個數
								nullCount++;
								countUnknown++;
								userListOptionUnknown.push(stuMap);
							}
						}
						optionInfo[stuAnswerOptionList[i]] = userListOptionList;
					}

				} else if(type == 4) { //多選題
					for(var i = 0; i < optionNumber; i++) {
						var count = 0;
						var trueCount = 0; // 正确统计
						var falseCount = 0; // 错误统计
						var userListOptionList = [];
						for(var answer of rows) {
							var userList = [];
							var userMap = {};
							var stuMap = {};

							stuMap["realname"] = answer.realname; //學生名；
							stuMap["userId"] = answer.user_id;
							stuMap["result"] = answer.result; //答題結果
							stuMap["deviceId"] = answer.device_id; //設備號
							stuMap["datamark"] = datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer.search(stuAnswerList[i]) != -1) {
								count++;
								userList.push(stuMap);
								//								userMap["count" + stuAnswerList[i]] = count;
								userMap["userGroupId"] = answer.usergroup_id;
								userMap["userGroupName"] = answer.name;
								userMap["userList"] = userList;
								userListOptionList.push(userMap)
								optionInfo["count" + stuAnswerList[i]] = count;
							}

							if(answer.result == 1) { //答對統計
								trueCount++; // 正确统计
								score = answer.score //分數
							} else if(answer.result == 0) { //答錯統計

								falseCount++; // 错误统计
							}
							if(answer.answer == null || answer.answer == '') { //未答題個數
								nullCount++;
								countUnknown++;
								userListOptionUnknown.push(stuMap);
							}
						}
						optionInfo[stuAnswerOptionList[i]] = userListOptionList;
					}

				}

			}

			dataMap["trueCount"] = trueCount,
				dataMap["falseCount"] = falseCount,
				dataMap["nullCount"] = nullCount,
				dataMap["optionInfo"] = optionInfo;
			dataMap["countUnknown"] = countUnknown;
			dataMap["userListOptionUnknown"] = userListOptionUnknown;
			res.json({
				data: dataMap,
				message: "分組教學模式 全組作答 查看單個題的答題情況",
				ret: 200
			})
		});

	}

});

function callback(result) {

}
module.exports = router;