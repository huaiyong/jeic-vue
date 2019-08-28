<template>
	<div>
		<div class="box" style="display: none;">
			<div>
				{{updateText}}
				<div v-if="downloadInfo.percent !== null">
					<p>{{updateInfo.releaseName}}</p>
					<p>大小：{{downloadInfo.totalMB}}MB</p>
					<p>速度：{{downloadInfo.KBPerSecond}}KB/s</p>
					<div class="big">
						<div class="small" :style="{width:downloadInfo.percent+'%'}"></div>
					</div>
				</div>
			</div>
			<div v-if="updateModalShow" class="pop">
				<h2 slot="title">{{updateInfo.releaseName}}</h2>
				<p slot="extra">{{currentVersion}} → {{updateInfo.version}}</p>
				<div v-html="updateInfo.releaseNotes"></div>
				<p>更新时间：{{updateInfo.releaseDate | dateFilter}}</p>
				<div>
					<button @click="closeUpdateModal">
						取消升级，下次启动时再询问
					</button>
					<button @click="updateConfirm">确认升级，将重启应用
					</button>
				</div>
			</div>
		</div>
		<div class="update" v-if="state">
			<div class="bg">
				<span>1.1.0版本</span>
			</div>
			<div class="describe">
				<p>[新增]分组教学功能</p>
				<p>[新增]分组教学功能</p>
				<p>[新增]分组教学功能</p>
			</div>
			<div class="btn clearfix">
				<div class="cancelBtn" @click="cancel()">
					取消
				</div>
				<div class="sureBtn">
					立即更新
				</div>
			</div>
			<div class="progressBar" style="display: none;">
				<div class="progress" :style="{width:downloadInfo.percent+'%'}">

				</div>
			</div>
		</div>
	</div>
</template>
<script>
	import packageJson from '../../../../package.json';
	export default {
		name: "update-version",
		data() {
			return {
				currentVersion: packageJson.version,
				updateText: '',
				downloadProgress: null,
				downloadInfo: {
					percent: null,
					totalMB: 0,
					KBPerSecond: 0,
				},
				updateModalShow: false,
				updateInfo: {
					releaseName: '',
					releaseNotes: '',
					releaseDate: '',
					version: '',
				},
				state: true,

			};
		},
		methods: {
			cancel() {
				this.state = false;
			},
			updateConfirm() {
				this.updateModalShow = false;
				this.$electron.ipcRenderer.send('update-now');
			},
			closeUpdateModal() {
				this.updateModalShow = false;
				this.updateText = '更新已取消';
			},
			update() {
				this.$electron.ipcRenderer.on('update-message', (event, msg) => {
					const message = msg.message;
					const data = msg.data;
					switch (message) {
						case 'error':
							this.updateText = '检查更新失败';
							this.downloadInfo = this.$options.data().downloadInfo;
							break;
							/* case 'checking-for-update':
							  this.updateText = '检查更新中';
							  break;*/
						case 'update-available':
							this.updateText = '有可用更新';
							this.updateInfo = {
								releaseDate: new Date(data.releaseDate).getTime() - new Date().getTimezoneOffset() * 60 * 1000,
								releaseName: data.releaseName,
								releaseNotes: data.releaseNotes,
								version: data.version,
							};
							break;
						case 'update-not-available':
							this.updateText = '已经是最新版';
							break;
						case 'download-progress':
							this.updateText = '';
							this.downloadInfo = {
								percent: data.percent.toFixed(2),
								totalMB: (data.total / 1024 / 1024).toFixed(3),
								KBPerSecond: (data.bytesPerSecond / 1024).toFixed(3),
							};
							break;
						case 'update-downloaded':
							this.updateText = '';
							this.downloadInfo = this.$options.data().downloadInfo;
							this.showUpdateModal();
							break;
						default:
							this.updateText = '';
							this.downloadInfo = this.$options.data().downloadInfo;
					}
				});
			},
		},
		created() {
			this.update();
		},
	};
</script>
<style scoped="scoped">
	.update {
		width: 480px;
		height: 480px;
		border-radius: 10px;
		background: #fff;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		margin: auto;
		z-index: 2;
	}

	.bg {
		width: 100%;
		height: 240px;
		background: url("../../assets/img/update.png") no-repeat center;
		background-size: 100%;
		position: absolute;
		top: -40px;
	}

	.bg span {
		width: 80px;
		height: 24px;
		text-align: center;
		line-height: 24px;
		color: #fff;
		border-radius: 16px;
		margin-top: 160px;
		margin-left: 160px;
		background: #89bfff;
		display: block;
	}

	.describe {
		position: absolute;
		top: 210px;
		padding-left: 36px;
		color: #666;
		font-size: 24px;
		line-height: 36px;
	}

	.btn {
		position: absolute;
		bottom: 0;
		width: 100%;
		height: 80px;
		border-top: 1px solid #ccc;
	}

	.btn div {
		width: 50%;
		height: 80px;
		box-sizing: border-box;
		text-align: center;
		line-height: 80px;
		font-size: 32px;
		color: #ccc;
		float: left;
		cursor: pointer;
	}

	.btn div:last-child {
		border-left: 1px solid #ccc;
		color: #5575ff;
	}

	.progressBar {
		width: 400px;
		height: 40px;
		border-radius: 20px;
		background: #d8d8d8;
		position: absolute;
		left: 0;
		right: 0;
		bottom: 30px;
		margin: 0 auto;
		overflow: hidden;

	}

	.progress {
		width: 20%;
		height: 100%;
		background: #5575ff;
	}
</style>
