var express = require('express');
var router = express.Router();
var url = require('url');
let async = require('async');

const AnswerResult = require('../entity/AnswerResult');

const httpUtil = require('../utils/httpUtil');
var config = require('../config')
const renderer = require("../../../modules/renderer");

const anwerResultDB = require('../db/anwerResultDB');
var log4js = require('log4js');
var logger = log4js.getLogger();
/*
 *通过下发记录ID获取每道题的整体答题结果
 *type(1全班作答2组长作答3全组作答)
 * */
router.get('/getAnswerByRecordId', function(req, res, next) {
	var recordId = req.param('recordId');
	var type = req.param('type');
	var usergroupId = req.param('usergroupId');
	var dataMap = {};
	//	var answerResultParam = new AnswerResult();
	//	answerResultParam.recordId = recordId;
	anwerResultDB.findAnswerResultByUsergroupId(recordId, usergroupId, function(rows) {
		if(rows.length > 0) {
			if(type == 1 || type == 2) {
				for(var answerResult of rows) {
					var resultMap = {};
					var datamark = answerResult.datamark;
					var result = answerResult.result;
					if(!dataMap.hasOwnProperty(datamark)) {
						resultMap["count"] = 1;
						resultMap["trueCount"] = 0;
						if(result == 1) {
							resultMap["trueCount"] = 1;
						}
					} else {
						resultMap = dataMap[datamark];
						var total = resultMap["count"];
						resultMap["count"] = total + 1;
						if(result == 1) {
							var trueCount = resultMap["trueCount"];
							resultMap["trueCount"] = trueCount + 1;
						}
					}
					resultMap["datamark"] = datamark;
					resultMap["nullCount"] = resultMap["count"] - resultMap["trueCount"];
					resultMap["accuracy"] = resultMap["trueCount"] / resultMap["count"];
					dataMap[datamark] = resultMap;
				}
				var list = [];
				for(var value in dataMap) {
					list.push(dataMap[value])
				}

				res.json({
					data: list,
					message: "获取答题器结果成功",
					ret: 200
				})
			} else if(type == 3) {
				res.json({
					data: null,
					message: "暂时空缺",
					ret: 200
				})
			} else {
				res.json({
					data: list,
					message: "type值错误",
					ret: 400
				})
			}

		}

	})

});

/*全班教學模式下 根據下發記錄Id 查詢 答題詳情  
分組教學模式下組長作答  根據下發記錄Id 查詢每一個小組的 答題詳情 （每一個組長的情況）*/
router.get('/getDataGroupByUser', function(req, res) {
	var type = req.param('type')
	var resultMap = {}
	var dataMap = {}
	var notTheAnswerCount = 0;
	var haveTheAnswerCount = 0;
	var answerResultList = [];
	if(type == 1) { //全班教學模式
		anwerResultDB.getDataGroupByUser(req, function(rows) {
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

	} else if(type == 2) { //分組教學 組長作答
		anwerResultDB.getDataGroupByUser(req, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					var stuMap = {};
					stuMap["usergroupName"] = answer.usergroupName; //學生名稱
					stuMap["Count"] = answer.Count; //總統計
					stuMap["trueCount"] = answer.trueCount; //正確統計
					stuMap["falseCount"] = answer.falseCount //錯誤統計
					stuMap["usergroupId"] = answer.usergroupId; //小組Id；
					stuMap["userName"] = answer.userName;
					stuMap["userId"] = answer.userId;
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
	} else if(type == 3) { //分組教學模式下 全組作答  
		anwerResultDB.getDataGroupByUser(req, function(rows) {
			if(rows.length > 0) {
				for(var answer of rows) {
					var stuMap = {};
					stuMap["studentName"] = answer.studentName; //學生名稱
					stuMap["Count"] = answer.Count; //總統計
					stuMap["trueCount"] = answer.trueCount; //正確統計
					stuMap["falseCount"] = answer.falseCount //錯誤統計
					stuMap["usergroupId"] = answer.usergroupId;
					stuMap["userName"] = answer.userName;
					stuMap["userId"] = answer.userId;
					console.log("小組" + answer.usergroupName);
					if(answer.answer == null || answer.answer == '') {
						notTheAnswerCount++;
					} else {
						haveTheAnswerCount++;
					}
					stuMap["accuracy"] = stuMap["trueCount"] / stuMap["Count"];
					answerResultList[0] = answer.usergroupName
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
// 查看單題選項答題情況 
router.get('/getDataByQuestionId', function(req, res) {
	var dataMap = {};
	var stuArray = new Array();
	var type = req.param('type');
	if(type == 1) { // 全班教學模式下 查看單題的答題情況
		anwerResultDB.getDataByQuestionId(req, function(rows) {
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
						stuMap["datamark"] = answer.datamark; //題號
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
							stuMap["datamark"] = answer.datamark; //題號	
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
								if(i == 0) {
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
							stuMap["datamark"] = answer.datamark; //題號
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer == null || answer.answer == '') { //未答題個數
								if(i == 0) {
									nullCount++;
									countUnknown++;
									userListOptionUnknown.push(stuMap);
								}
							} else {
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
		anwerResultDB.getDataByQuestionId(req, function(rows) {
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
						stuMap["datamark"] = answer.datamark; //題號
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
							optionNO["userListOptionNO"] = userListOptionNO;
						} else {
							countUnknown++;
							userList.push(stuMap);
							optionMap["userGroupName"] = answer.name; //小組名稱
							optionMap["userGroupId"] = answer.usergroup_id; //小組ID
							optionMap["userList"] = userList;
							optionUnknown["countUnknown"] = countUnknown;
							userListOptionUnknown.push(optionMap);
							optionUnknown["userListOptionUnknown"] = userListOptionUnknown;
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
							stuMap["datamark"] = answer.datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer === stuAnswerList[i]) {
								count++;
								userList.push(stuMap);
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
								if(i == 0) {
									nullCount++;
									countUnknown++;
									userList.push(stuMap);
									userMap["userGroupId"] = answer.usergroup_id;
									userMap["userGroupName"] = answer.name;
									userMap["userList"] = userList;
									userListOptionUnknown.push(userMap)
									optionUnknown["userListOptionUnknown"] = userListOptionUnknown;
								}
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
							stuMap["datamark"] = answer.datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer.search(stuAnswerList[i]) != -1) {
								count++;
								userList.push(stuMap);
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
								if(i == 0) {
									nullCount++;
									countUnknown++;
									userList.push(stuMap);
									userMap["userGroupId"] = answer.usergroup_id;
									userMap["userGroupName"] = answer.name;
									userMap["userList"] = userList;
									userListOptionUnknown.push(userMap)
									optionUnknown["userListOptionUnknown"] = userListOptionUnknown;
								}
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
		anwerResultDB.getDataByQuestionId(req, function(rows) {
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
				var userList = [];
				if(type == 1) { // 判斷題   判 斷當前題的題型  1 判斷題 2 單選  4 多選
					for(var answer of rows) {
						var stuMap = {};
						stuMap["realname"] = answer.realname; //學生名；
						stuMap["userId"] = answer.user_id;
						stuMap["result"] = answer.result; //答題結果
						stuMap["deviceId"] = answer.device_id; //設備號
						stuMap["datamark"] = answer.datamark; //題號
						stuMap["answer"] = answer.answer; //學生答案
						stuMap["trueAnswer"] = answer.true_answer; //正確答案;
						stuMap["score"] = answer.score; //分數
						if(answer.answer === "YES") {
							countYES++;
							userListOptionYES.push(stuMap);
							optionYES["usergroupId"] = answer.usergroup_id;
							optionYES["usergroupName"] = answer.name;
						} else if(answer.answer === "NO") {
							countNO++;
							userListOptionNO.push(stuMap);
							optionNO["usergroupId"] = answer.usergroup_id;
							optionNO["usergroupName"] = answer.name;
						} else {
							countUnknown++;
							userListOptionUnknown.push(stuMap);
							optionUnknown["usergroupId"] = answer.usergroup_id;
							optionUnknown["usergroupName"] = answer.name;
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
							stuMap["datamark"] = answer.datamark; //題號	
							stuMap["answer"] = answer.answer; //學生答案
							stuMap["trueAnswer"] = answer.true_answer; //正確答案;
							stuMap["score"] = answer.score; //分數
							if(answer.answer === stuAnswerList[i]) {
								count++;
								userList.push(stuMap);
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
								if(i == 0) {
									nullCount++;
									countUnknown++;
									userList.push(stuMap);
									userMap["userGroupId"] = answer.usergroup_id;
									userMap["userGroupName"] = answer.name;
									userMap["userList"] = userList;
									userListOptionUnknown.push(userMap)
									optionUnknown["userListOptionUnknown"] = userListOptionUnknown;
								}
							}
						}
						optionInfo[stuAnswerOptionList[i]] = userList;
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
							stuMap["datamark"] = answer.datamark; //題號	
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
			res.json({
				data: dataMap,
				message: "分組教學模式 全組作答 查看單個題的答題情況",
				ret: 200
			})
		});

	}

});
/**
 * 通过学生ID获取该学生的答题情况
 */
router.get('/getDataByUserId', function(req, res) {
	var recordId = req.param('recordId');
	var userId = req.param('userId');
	var answerResultParam = new AnswerResult();
	answerResultParam.recordId = recordId;
	answerResultParam.userId = userId;
	var resultMap = {};
	var trueCount = 0;
	var falseCount = 0;
	var nullCount = 0;
	var score = 0;

	anwerResultDB.getDataByUserId(answerResultParam, function(rows) {
		if(rows.length > 0) {
			for(var answerResult of rows) {
				if("1" == answerResult.result) {
					trueCount++;
					score += answerResult.score;
				} else if("0" == answerResult.result) {
					falseCount++;
				} else {
					nullCount++;
				}
			}

			resultMap["trueCount"] = trueCount;
			resultMap["falseCount"] = falseCount;
			resultMap["nullCount"] = nullCount;
			resultMap["score"] = score;
			resultMap["list"] = rows;
		}
		res.json({
			data: resultMap,
			message: "获取数据成功",
			ret: 200
		})
	})

})

var answerList = [];

//定义一个get请求 path为根目录
/* GET home page. */
router.get('/insertAnswer', function(req, res, next) {
	var recordId = req.param('recordId');
	// 答过题的用户
	answerList = global.answerList;
	// 获取答题器信息 处理答题器获取到的数据 并去重
	var answerMap = new Map();
	for(var index in answerList) {
		var answerResult = answerList[index];
		var deviceId = answerResult.deviceId; // 答题数据中的答题器编号
		var datamark = answerResult.datamark; // 答题数据中的题号
		answerResult.recordId = recordId;
		answerMap.set(deviceId + "_" + datamark, answerResult);
	}
	//查询该次下发所有的试题信息
	var answerResultParam = new AnswerResult();
	answerResultParam.recordId = recordId;
	anwerResultDB.findAnswerResult(answerResultParam, function(rows) {
		if(rows.length > 0) {
			for(var answerResult of rows) {
				var deviceId = answerResult.device_id; // 答题数据中的答题器编号
				var datamark = answerResult.datamark; // 答题数据中的题号
				var ar = answerMap.get(deviceId + "_" + datamark);
				if(typeof(ar) == "undefined") {
					continue;
				}
				ar.type = answerResult.type;
				ar.trueAnswer = answerResult.true_answer;
				var resultStr = checkResult(ar);
				ar.result = resultStr;
				anwerResultDB.updateAnswerResult(ar);
			}
		}
	})
	// 获取pad答题数据信息进行处理

	//获取用户答案后发送给管理端
	//syncDataToAdmin(answerList);
	//调用答题器  结束答题
	renderer.answerStop();
	//返回结果
	res.json({
		message: "",
		ret: 200
	})
});

/**
 * 判断是否正确
 * @param answerResult
 */
function checkResult(answerResult) {
	if("1" == answerResult.type) {
		if(answerResult.answer == "1" && answerResult.trueAnswer == "YES") {
			return "1";
		}
	} else if("4" == answerResult.type) {
		if(sort(answerResult.answer) == answerResult.trueAnswer.toLowerCase()) {
			return "1";
		}
	} else {
		if(answerResult.answer == answerResult.trueAnswer) {
			return "1";
		}
	}
	return "0";
}

function sort(str) {
	var arr1 = str.split('');
	arr1.sort(function(a, b) {
		if(a.toString().toLowerCase() > b.toString().toLowerCase())
			return 1;
		return -1;
	})
}

/**
 * 向管理端同步数据
 * @param resultList
 */
function syncDataToAdmin(resultList) {
	var paramList = [];
	for(var index in answerList) {
		var answerResult = answerList[index];
		paramList.push(answerResult.toData());
	}
	httpUtil.httpPostJSON(config.adminStuAnswer, paramList);
}

module.exports = router;