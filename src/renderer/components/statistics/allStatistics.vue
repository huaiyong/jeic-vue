<template>
	<div class="wrapper">

		<!-- 		<router-link :to="{name:'AnswerDetails'}">学生统计</router-link> -->
		<div class="getClasstjtc">
			<div class="tcContent">
				<!-- 分组选择左侧栏 -->
				<div class="fzleft"  v-if="!pattern&&model==3">
					<p>
						<button v-bind:class="{ active:cancelbtn==true}">全部</button>
					</p>
					<ul>
						<li v-for="(item,index) in groupStudent" v-on:click="addClass(index,item.id)" v-bind:class="{ active:index==current}">{{item.name}}</li>
					</ul>
				</div>
				<div class="menberight">
					<!-- 班级答题统计 -->
					<div class="pingjuntrue">
						<ul class="banjiuldati">
							<li>测试平均正确率：
								<p class="pingjunzitiset">{{averagelv2}}%</p>
							</li>
							<li>已答题人数：<span></span>{{haveTheAnswerCount}}人</li>
							<li>未答题人数：<span></span>{{notTheAnswerCount}}人</li>
						</ul>
					</div>
					<!--班级答题统计表格-->
					<div class="grop_list_show classtableset">
						<!-- 柱状图标 -->
						<div class="paichange" v-show="changeTab">
							<div id="container2" ref="container2" style="width:100%;height:100%;"></div>
						</div>
						<!-- 表格 -->
						<div class="paichangetable" v-show="!changeTab">
							<table border="0" cellspacing="0" cellpadding="0" class="studentScoce">
								<thead>
									<tr>
										<th>题号<i class="iconfont icon-paixusheng"></i></th>
										<th>正确人数</th>
										<th>错误人数<i class="iconfont icon-paixu-jiang"></i></th>
										<th>正确率</th>
									</tr>
								</thead>
								<tbody>
									<tr v-for="(item,index) in tableData">
										<td class="tihaodianji" @click="getQuestionNum(item.datamark)">
											{{item.datamark}}
										</td>
										<td>{{item.trueCount}}</td>
										<td>{{item.nullCount}}</td>
										<td>{{(item.accuracy*100) | toFixed(2)}}%</td>
									</tr>
								</tbody>
							</table>
						</div>
						<div style="text-align:center;">
							<span v-if="changeTab" @click="switchTab()" id="switchPai" class="lvsebtn">查看表格</span>
							<span v-if="!changeTab" @click="switchTab()" id="switchPai" class="lvsebtn">查看图表</span>
							<span id="studentResultbtn" class="lvsebtn" @click="rankingStatistics()">查看详情</span>
						</div>
					</div>
				</div>
			</div>
		</div>
		<span class="closefullscreen fr" @click="back()">
			<em class="iconfont icon-guanbi1 exitResTc colorfff"></em>
		</span>
	</div>
</template>

<script>
	import {
		mapState
	} from "vuex";

	export default {
		name: "AnswerStatistics",
		data() {
			return {
				current:-1,
				groupStudent:[],
				cancelbtn:true,
				changeTab: true,
				tableData: [],
				averagelv2:0,
				haveTheAnswerCount:0,
				notTheAnswerCount:0,
			  text:this.$route.params.text,
			  eachRecordId:this.$route.params.id,
				notTheAnswerCount:0,
				usergroupId:'',
				changeId:''
			}
		},
		computed: {
			...mapState({
				recordId: state => state.state.recordId,
				pattern: state => state.state.pattern,
				model: state => state.state.model,
				groupId: state => state.state.groupId
			})
		},
		methods: {
			back() {
				this.$router.back();
			},
			addClass:function(index,id){
				  this.cancelbtn=false;
				  this.current=index;
				  this.usergroupId=id;
				  console.log(this.usergroupId)
			},
			
			//切换btn柱状图的班级图表
			switchTab: function() {
				this.changeTab = !this.changeTab;
			},
			getQuestionNum: function(num) {
				this.$router.push({
					name: 'singleStatistics',
					params: {
						id: num
					},
				})
			},
			rankingStatistics: function() {
				this.$router.push({
					name: 'rankingStatistics',
				})
			},
			//chart图表
			displayChart: function(dataX,dataY) {
				let myChart = this.$echarts.init(this.$refs.container2);
				var option = {
					title: {
						text: '正确率统计图表',
						textStyle: {
							fontWeight: 'bold', //标题颜色
							color: '#eee',
							fontSize: 20
						},
						subtext: '',
						x: 'center'
					},
					xAxis: {
						type: 'category',
						data: dataX,
						axisLabel: {
							show: true,
							rotate: 45,
							textStyle: {
								color: '#eee',
								fontSize: 24
							},
				
						}
					},
					yAxis: {
						type: 'value',
						axisLabel: {
							formatter: '{value}%',
							textStyle: {
								color: '#eee',
								fontSize: 30
							}
						}
					},
					series: [{
						data: dataY,
						type: 'bar',
						itemStyle: {
							normal: {
								color: '#78B1E8',
								label: {
									show: false, //开启显示
									position: 'top', //在上方显示
									textStyle: { //数值样式
										color: '#fff',
										fontSize: 26
									}
								}
							}
						},
					}]
				};

				myChart.setOption(option);
				var that=this;
				myChart.on('click', function(params) {
					console.log()
					that.$router.push({
						name: 'singleStatistics',
						params: {
							id: params.dataIndex+1
						},
					})
				});
			}
		},
		created() {
			var that=this;
			if(this.text){
				this.changeId = this.eachRecordId;
				console.log(this.changeId,'gaibian2')
			}else{
				this.changeId = this.recordId;
				console.log(this.changeId,'gaibian1')
			}
			this.$http.get("http://localhost:3000/jeic/api/answerResult/getAnswerByRecordId?recordId="+this.changeId+'&type=1').then(function(res) {
				console.log(res)
				var tishuliangnum=[];
				var banjibaifenbi=[];
				var averagelv=0
				var chushu = res.data.data.length;
				that.tableData=res.data.data
				for (var i = 0; i < res.data.data.length; i++) {
					banjibaifenbi.push(res.data.data[i].accuracy * 100);
					tishuliangnum.push(i + 1 + "题")
					averagelv = averagelv + res.data.data[i].accuracy;
				}
				that.averagelv2 = parseFloat(averagelv * 100 / chushu).toFixed(2)
				that.displayChart(tishuliangnum,banjibaifenbi)
			});
			
			//获取分组学生
			this.$http.get("http://127.0.0.1:3000/jeic/api/teachingGroup/"+this.groupId).then(function(
				res) {
				if (res.data.ret == 200) {
					that.groupStudent = res.data.data.userGrouplist;
					console.log(res.data)
				};
			});
			
			this.$http.get("http://127.0.0.1:3000/api/getDataGroupByUser?recordId="+this.changeId+'&type='+this.model+'&usergroupId='+this.usergroupId).then(function(res) {
				console.log(res,'已答题认识')
				that.haveTheAnswerCount = res.data.data.haveTheAnswerCount
				that.notTheAnswerCount = res.data.data.notTheAnswerCount
			});
		},
		mounted() {
			this.displayChart()
			console.log(this.text,'text')
			console.log(this.eachRecordId,'id')
		}
	}
</script>

<style scoped>
	
	.wrapper{
		position: relative;
		z-index: 2;
		width: 100%;
		height: 100%;
	}
	
	.backLast {
		background: none;
		color: #fff;
		border: 0;
		font-size: 3rem;
		position: absolute;
		bottom: 3rem;
		left: 3rem;
	}
	
	.fzleft p button{
		width: 8rem;
		height: 2.6rem;
		background: #fff;
		border: 0;
		color: #000;
		border-radius: 10px;
		box-shadow: 0px 1px 13px #5f5d5d;
		font-size:1.2rem;
		margin:6rem 0;
	}
	
	.active{
		background: #fe9c02!important;
		color:#fff!important;
	}
	
	.fzleft>ul>li{
		display: inline-block;
		width: 8rem;
		height: 2.6rem;
		background: #fff;
		border: 0;
		color: #101010;
		border-radius: 10px;
		font-size: 1.2rem;
		margin: 1rem .2rem;
		text-align: center;
		line-height: 2.6rem;
		cursor: pointer;
	}
	
	.fzleft{
		width:20.3rem;
		height:100%;
		background: #78b1e8;
		float:left;
		box-sizing: border-box;
		padding-left:3rem;
	}

	.closefullscreen {
		position: absolute;
		top: -1px;
		right: 0;
		width: auto;
		height: auto;
		display: inline-block;
		background: transparent;
		box-shadow: none;
		border-radius: 0;
		border: 0;
		z-index: 999;
	}

	.colorfff {
		color: #fff;
	}

	.exitResTc {
		font-size: 3rem !important;
		opacity: 1;
		cursor: pointer;
	}

	.getClasstjtc {
		background: rgb(137, 137, 137);
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		margin: 0 auto;
	}

	.getClasstjtc>.tcContent {
		width: 100%;
		min-height: 30rem;
		height: 100%;
		background: rgb(82, 86, 89);
		color: #fff;
		text-align: left;
	}

	.menberight {
		width: calc(100% - 20.3rem);
		height: 100%;
		float: left;
	}

	.pingjuntrue {
		width: 20%;
		float: right;
		padding: 10% 1%;
		height: 100%;
		box-sizing: border-box;
	}

	.banjiuldati li {
		margin: 2rem 0;
	}

	.banjiuldati {
		padding: 2%;
		box-sizing: content-box;
		font-size: 1.6rem;
	}

	.pingjunzitiset {
		text-align: center;
		font-size: 5.8rem;
		font-weight: bold;
		color: #FFC107;
		margin: 2rem 0;
	}

	.classtableset {
		width: 80%;
		height: 100%;
		float: left;
	}

	.paichangetable {
		width: 100%;
		height: 75%;
		margin-top: 2rem;
		overflow-y: auto;
	}

	.studentScoce tbody tr td {
		border-top: .1rem solid #d0d0d0;
	}

	.studentScoce {
		width: 90%;
		border-collapse: separate;
		color: #222;
		margin: 2rem auto;
		font-size: 1.6rem;
	}

	.studentScoce thead tr th {
		text-align: center;
		height: 4rem;
		line-height: 4rem;
		background: #C7EDCC;
	}

	.studentScoce thead tr th:nth-child(1) {
		cursor: pointer;
	}

	.studentScoce thead tr th:nth-child(3) {
		cursor: pointer;
	}

	.studentScoce tbody tr td {
		text-align: center;
		height: 4rem;
		line-height: 4rem;
	}

	.studentScoce tbody tr {
		background: #C7EDCC;
	}

	.tihaodianji {
		cursor: pointer;
		color: #2196F3 !important;
		font-weight: bold;
		background: #C7EDCC;
		border-right: .1rem solid #eae8e8;
	}

	.paichange {
		display: block;
		width: 100%;
		height: 75%;
		margin-top: 2rem;
	}

	#switchPai,
	#studentResultbtn,
	.fanhuipai {
		display: inline-block;
		width: 15rem;
		margin: 1rem auto;
		height: 3.6rem;
		line-height: 3.6rem;
		border-radius: .8rem;
		color: #57e4c0;
		cursor: pointer;
		font-size: 1.6rem;
	}

	#studentResultbtn {
		margin-left: 20px;
	}

	.lvsebtn {
		border: .1rem solid #57e4c0;
		box-shadow: 0 0 0 0 #607D8B;
	}
</style>
