<template>
	<div class="wrapper">
		<div class="singleTest">
			<!-- 柱状图 -->
			<div class="zhutuabcd">
				<div id="myChart" style="width:100%;height:60%;"></div>
				<!--   选项人数  -->
				<div class="wx_selectkuang" v-show="clickEcharts">
					<p class="slectStrcolor">选择<span class="xuanxiangkuang" v-html="xuanxiang"></span>选项的同学：</p>
					<ul class="xuanxiangullist">
						<li v-for="stulist in stulists">{{stulist.realname}}</li>
					</ul>
				</div>
			</div>

			<!-- 试题讲解 -->
			<div class="studentDatirenshu">
				<div class="tihaotcset">
					<div class="tiganul">
						<div>
							<div v-if="sttype=='1'" class="zmj_answerType">判断</div>
							<div v-if="sttype=='2'" class="zmj_answerType">单选</div>
							<div v-if="sttype=='4'" class="zmj_answerType">多选</div>
							<p class="wx_tigan" v-html="tigan"></p>
							<ul class="xuanxianguloption">
								<li v-if="stlist.text.length!=0" v-for="stlist in stlists" v-html="stlist.text"></li>
							</ul>
						</div>
					</div>
				</div>

				<div class="zmj_answerItem clearfix">
					<div class="change">
						<i class="iconfont icon-zuojiantou" @click="prevTest()" v-show="tihao>1"></i>
						<span>第<i v-text="tihao"></i>题</span>
						<i class="iconfont icon-youjiantou" @click="nextTest()" v-show="tihao<total"></i>
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
		name: "AnswerDetails",
		data() {
			return {
				stlists: [], //试题选项
				tigan: "",
				sttype: "",
				tihao: 0,
				total: 0,
				clickEcharts: false,
				xuanxiang: "",
				stulists: [],
				stulistsA:[],
				stulistsB:[],
				stulistsC:[],
				stulistsD:[],
				stulistsE:[],
				stulistsF:[],
				stulistsG:[],
				stulistsH:[],
				stulistsI:[],
				stulistsJ:[],
				stulistsYES:[],
				stulistsNO:[],
				optionNu: 0
			}
		},
		mounted() {
			this.getParams()
		},
		created() {
			this.getParams()
		},
		computed: {
			...mapState({
				resourceId: state => state.state.resourceId,
				pattern: state => state.state.pattern,
				recordId: state => state.state.recordId,
				model: state => state.state.model,
			})
		},
		methods: {
			back() {
				this.$router.back();
			},
			getResult() {
				const that = this;
				var xdata = [];
				var ydata = [];
				console.log(this.model)
				// 获取单道试题的答题结果
				this.$http.get("http://127.0.0.1:3000/api/getDataByQuestionId?recordId=" + this.recordId + "&type="+this.model+"&datamark=" +
					this.tihao).then(function(res) {
					console.log("-----")
					console.log(res)
					that.optionNu = res.data.data.optionNu;
					console.log(that.optionNu)
					that.sttype = res.data.data.type;
					if (that.sttype != "1") {
						if (that.optionNu == 1) {
							xdata = ["A"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 2) {
							xdata = ["A", "B"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 3) {
							xdata = ["A", "B", "C"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 4) {
							xdata = ["A", "B", "C", "D"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							console.log(that.stulistsA)
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 5) {
							xdata = ["A", "B", "C", "D", "E"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 6) {
							xdata = ["A", "B", "C", "D", "E", "F"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							ydata[5] = res.data.data.optionInfo.optionF.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.stulistsF=res.data.data.optionInfo.optionF.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 7) {
							xdata = ["A", "B", "C", "D", "E", "F", "G"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							ydata[5] = res.data.data.optionInfo.optionF.count;
							ydata[6] = res.data.data.optionInfo.optionG.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.stulistsF=res.data.data.optionInfo.optionF.userList;
							that.stulistsG=res.data.data.optionInfo.optionG.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 8) {
							xdata = ["A", "B", "C", "D", "E", "F", "G", "H"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							ydata[5] = res.data.data.optionInfo.optionF.count;
							ydata[6] = res.data.data.optionInfo.optionG.count;
							ydata[7] = res.data.data.optionInfo.optionH.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.stulistsF=res.data.data.optionInfo.optionF.userList;
							that.stulistsG=res.data.data.optionInfo.optionG.userList;
							that.stulistsH=res.data.data.optionInfo.optionH.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 9) {
							xdata = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							ydata[5] = res.data.data.optionInfo.optionF.count;
							ydata[6] = res.data.data.optionInfo.optionG.count;
							ydata[7] = res.data.data.optionInfo.optionH.count;
							ydata[8] = res.data.data.optionInfo.optionI.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.stulistsF=res.data.data.optionInfo.optionF.userList;
							that.stulistsG=res.data.data.optionInfo.optionG.userList;
							that.stulistsH=res.data.data.optionInfo.optionH.userList;
							that.stulistsI=res.data.data.optionInfo.optionI.userList;
							that.drawLine(xdata, ydata)
						} else if (that.optionNu == 10) {
							xdata = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
							ydata[0] = res.data.data.optionInfo.optionA.count;
							ydata[1] = res.data.data.optionInfo.optionB.count;
							ydata[2] = res.data.data.optionInfo.optionC.count;
							ydata[3] = res.data.data.optionInfo.optionD.count;
							ydata[4] = res.data.data.optionInfo.optionE.count;
							ydata[5] = res.data.data.optionInfo.optionF.count;
							ydata[6] = res.data.data.optionInfo.optionG.count;
							ydata[7] = res.data.data.optionInfo.optionH.count;
							ydata[8] = res.data.data.optionInfo.optionI.count;
							ydata[9] = res.data.data.optionInfo.optionJ.count;
							that.stulistsA=res.data.data.optionInfo.optionA.userList;
							that.stulistsB=res.data.data.optionInfo.optionB.userList;
							that.stulistsC=res.data.data.optionInfo.optionC.userList;
							that.stulistsD=res.data.data.optionInfo.optionD.userList;
							that.stulistsE=res.data.data.optionInfo.optionE.userList;
							that.stulistsF=res.data.data.optionInfo.optionF.userList;
							that.stulistsG=res.data.data.optionInfo.optionG.userList;
							that.stulistsH=res.data.data.optionInfo.optionH.userList;
							that.stulistsI=res.data.data.optionInfo.optionI.userList;
							that.stulistsJ=res.data.data.optionInfo.optionJ.userList;
							that.drawLine(xdata, ydata)
						}
					} else {
						xdata = ["YES", "NO"];
						ydata[0] = res.data.data.optionInfo.optionYES.count;
						ydata[1] = res.data.data.optionInfo.optionNO.count;
						that.stulistsYES=res.data.data.optionInfo.optionYES.userList;
						that.stulistsNO=res.data.data.optionInfo.optionYES.userList;
						that.drawLine(xdata, ydata)
					}
				});
				
				// 获取试题
				this.$http.get(this.configure.resourceIp + '/teacher/import/getQuestionInfo.do?hid=' + this.resourceId + '&sort=' +
					this.tihao).then(
					function(res) {
						console.log(res)
						if (res.data.ret == 200) {
							that.stlists = res.data.data.data[0].option; //试题选项ABCD....
							that.tigan = res.data.data.data[0].body; //题干....
							that.total = res.data.data.total; //总题数
						};
					});
			},
			getParams() {
				var routerParams = this.$route.params.id; // 取到路由带过来的参数 
				this.tihao = routerParams; // 将数据放在当前组件的数据内

				if (this.tihao != undefined) {
					this.getResult()
				}
			},
			prevTest() {
				this.tihao = this.tihao - 1;
				const that = this;
				that.clickEcharts = false;
				this.getResult()
			},
			nextTest() {
				this.tihao = parseInt(this.tihao) + 1;
				const that = this;
				that.clickEcharts = false;
				this.getResult()
			},
			drawLine(x, y) {
				// 基于准备好的dom，初始化echarts实例
				let myChart = this.$echarts.init(document.getElementById('myChart'))
				var option = {
					title: {
						text: ''
					},
					tooltip: {},
					xAxis: {
						data: x,
						triggerEvent: true,
						axisTick: {
							alignWithLabel: true //坐标值是否在刻度中间
						},
						axisLabel: {
							show: true,
							textStyle: {
								color: '#e5e5e5',
								fontSize: 30
							}
						}
					},
					yAxis: {
						minInterval: 1, //y轴显示整数
						axisLabel: {
							show: true,
							formatter: '{value}人',
							textStyle: {
								color: '#e5e5e5',
								fontSize: 26
							}
						}
					},
					series: {
						name: '选项',
						type: 'bar',
						data: y,
						itemStyle: {
							normal: {
								color: function(params) {
									var colorList = ['#78b1e7'];
									//若返回的list长度不足，不足部分自动显示为最后一个颜色
									return colorList[params.dataIndex]
								},
								label: {
									show: false,
									position: 'top'
								},
								textStyle: { //数值样式
									color: '#fff',
									fontSize: 26
								}
							}
						}
					}
				};

				// 绘制图表
				myChart.setOption(option);
				// 点击A\B\C\D
				const that = this;
				myChart.on('click', function(params) {
					console.log(params.name)
					that.xuanxiang = params.name
					that.clickEcharts = true;
					that.stulists = [];
					if (params.name == "A") {
						that.stulists=that.stulistsA;
					} else if (params.name == "B") {
						that.stulists=that.stulistsB;
					} else if (params.name == "C") {
						that.stulists=that.stulistsC;
					} else if (params.name == "D") {
						that.stulists=that.stulistsD;
					} else if (params.name == "E") {
						that.stulists=that.stulistsE;
					} else if (params.name == "F") {
						that.stulists=that.stulistsF;
					} else if (params.name == "G") {
						that.stulists=that.stulistsG;
					} else if (params.name == "H") {
						that.stulists=that.stulistsH;
					} else if (params.name == "I") {
						that.stulists=that.stulistsI;
					} else if (params.name == "J") {
						that.stulists=that.stulistsJ;
					} else if (params.name == "YES") {
						that.stulists=that.stulistsYES;
					} else if (params.name == "NO") {
						that.stulists=that.stulistsNO;
					}
					
				});
			}
		},
		watch: {
			// 监测路由变化,只要变化了就调用获取路由参数方法将数据存储本组件即可
			'$route': 'getParams',
		}
	}
</script>

<style scoped>
	.wrapper {
		color: #fff;
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

	.singleTest {
		background: rgb(82, 86, 89);
		width: 100%;
		height: 100%;
	}

	.zhutuabcd {
		width: 50%;
		height: 100%;
		float: left;
		margin-left: 5px;
	}

	.slectStrcolor {
		font-size: 2rem;
	}

	.xuanxiangkuang {
		background: #599cec;
		padding: 0 9px;
	}

	.xuanxiangullist {
		margin-top: 20px;
	}

	.xuanxiangullist li {
		font-size: 1.8rem;
		display: inline-block;
		line-height: 2rem;
		margin: 0 10px;
	}

	.studentDatirenshu {
		width: calc(50% - 5px);
		height: 100%;
		float: left;
		overflow-y: scroll;
	}

	.tiganul {
		font-size: 3rem;
		position: relative;
	}

	.wx_tigan {
		text-indent: 9rem;
		color: rgb(255, 183, 16);
	}

	.tiganul li {
		line-height: 4rem;
	}

	.xuanxianguloption {
		list-style-type: upper-alpha;
		margin-left: 4rem;
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

	.exitResTc {
		font-size: 3rem !important;
		opacity: 1;
		cursor: pointer;
	}
</style>
