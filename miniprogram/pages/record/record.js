import { evaluateVocal } from '../../utils/api';

Page({
  data: {
    songId: null,
    songName: '',
    artist: '',
    isRecording: false,
    recordDuration: 0,
    recordTimer: null,
    tempFilePath: '',
    hasRecorded: false,
    isSubmitting: false,
    // 音频播放相关
    isPlaying: false,
    currentTime: '00:00',
    duration: '00:00',
    audioContext: null,
    // 录音计时文本（用于WXML绑定）
    recordTimeText: '00:00',
  },

  onLoad(options) {
    // 获取从首页传入的歌曲信息
    const { songId } = options;
    this.setData({ songId });

    // 这里应该根据songId获取歌曲详情，暂时使用模拟数据
    this.loadSongInfo(songId);

    // 确保初始时间显示格式正确
    this.setData({
      currentTime: '00:00',
      duration: '00:00',
      recordTimeText: '00:00',
    });
  },

  onUnload() {
    // 页面卸载时清理计时器和录音管理器
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer);
    }
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
    // 清理音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 加载歌曲信息
  loadSongInfo(songId) {
    // 模拟歌曲数据
    const songMap = {
      1: { name: '小星星', artist: '儿歌' },
      2: { name: '生日快乐', artist: '传统' },
      3: { name: '两只老虎', artist: '儿歌' },
      4: { name: '茉莉花', artist: '民歌' },
      5: { name: '月亮代表我的心', artist: '邓丽君' },
    };

    const songInfo = songMap[songId] || {
      name: '未知歌曲',
      artist: '未知歌手',
    };
    this.setData({
      songName: songInfo.name,
      artist: songInfo.artist,
    });
  },

  // 开始录音
  startRecord() {
    const that = this;

    // 检查录音权限
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              that.doStartRecord();
            },
            fail() {
              wx.showToast({
                title: '需要录音权限，请在设置中开启',
                icon: 'none',
                duration: 2000,
              });
            },
          });
        } else {
          that.doStartRecord();
        }
      },
    });
  },

  // 执行开始录音
  doStartRecord() {
    const that = this;

    // 创建录音管理器
    const recorderManager = wx.getRecorderManager();

    // 监听录音开始事件
    recorderManager.onStart(() => {
      that.setData({
        isRecording: true,
        recordDuration: 0,
        tempFilePath: '',
        hasRecorded: false,
        recordTimeText: '00:00',
      });

      // 启动计时器
      const timer = setInterval(() => {
        const currentDuration = that.data.recordDuration + 1;
        that.setData({
          recordDuration: currentDuration,
          recordTimeText: that.formatTime(currentDuration),
        });
      }, 1000);

      that.setData({ recordTimer: timer });

      wx.showToast({
        title: '开始录音',
        icon: 'success',
      });
    });

    // 监听录音结束事件
    recorderManager.onStop((res) => {
      console.log('录音结束，文件路径:', res.tempFilePath);
      console.log('录音时长:', res.duration);

      // 清理计时器
      if (that.data.recordTimer) {
        clearInterval(that.data.recordTimer);
      }

      // 若SDK提供了duration（ms），以其为准更新展示
      const durationSec =
        typeof res.duration === 'number'
          ? Math.round(res.duration / 1000)
          : that.data.recordDuration;

      // 立即设置音频播放的持续时间显示
      const formattedDuration = that.formatTime(durationSec);

      that.setData({
        isRecording: false,
        recordTimer: null,
        tempFilePath: res.tempFilePath,
        hasRecorded: true,
        recordDuration: durationSec,
        recordTimeText: formattedDuration,
        duration: formattedDuration, // 设置音频播放器的总时长
      });

      wx.showToast({
        title: '录音完成',
        icon: 'success',
      });
    });

    // 监听录音错误事件
    recorderManager.onError((error) => {
      console.error('录音错误:', error);
      wx.showToast({
        title: '录音失败，请重试',
        icon: 'none',
      });
    });

    // 开始录音
    recorderManager.start({
      duration: 30000, // 最长录音时间30秒
      sampleRate: 16000, // 采样率
      numberOfChannels: 1, // 录音通道数
      encodeBitRate: 48000, // 编码码率
      format: 'mp3', // 音频格式
      frameSize: 50, // 指定帧大小
    });

    // 保存录音管理器实例
    this.recorderManager = recorderManager;
  },

  // 停止录音
  stopRecord() {
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  },

  // 录音按钮点击
  handleRecordClick() {
    if (this.data.isRecording) {
      this.stopRecord();
    } else {
      this.startRecord();
    }
  },

  // 重新录制
  retryRecord() {
    this.setData({
      tempFilePath: '',
      hasRecorded: false,
      recordDuration: 0,
      recordTimeText: '00:00',
      currentTime: '00:00',
      duration: '00:00',
      isPlaying: false,
    });

    // 清理音频上下文
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
      this.setData({ audioContext: null });
    }
  },

  // 格式化时间显示
  formatTime(seconds) {
    // 确保输入是数字，并向下取整到秒
    const totalSeconds = Math.floor(Number(seconds) || 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  },

  // 音频播放控制
  togglePlay() {
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '没有录音文件',
        icon: 'none',
      });
      return;
    }

    if (this.data.isPlaying) {
      this.pauseAudio();
    } else {
      this.playAudio();
    }
  },

  // 播放音频
  playAudio() {
    if (!this.data.audioContext) {
      this.initAudioContext();
    }

    const audioContext = this.data.audioContext;
    audioContext.play();
    this.setData({ isPlaying: true });
  },

  // 暂停音频
  pauseAudio() {
    if (this.data.audioContext) {
      this.data.audioContext.pause();
      this.setData({ isPlaying: false });
    }
  },

  // 初始化音频上下文
  initAudioContext() {
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.tempFilePath;

    audioContext.onPlay(() => {
      console.log('音频开始播放');
    });

    audioContext.onTimeUpdate(() => {
      // 确保时间显示格式正确，去掉小数部分
      const currentTime = this.formatTime(audioContext.currentTime);
      const duration = this.formatTime(audioContext.duration);
      this.setData({
        currentTime,
        duration,
      });
    });

    audioContext.onEnded(() => {
      this.setData({ isPlaying: false });
    });

    audioContext.onError((error) => {
      console.error('音频播放错误:', error);
      wx.showToast({
        title: '音频播放失败',
        icon: 'none',
      });
      this.setData({ isPlaying: false });
    });

    this.setData({ audioContext });
  },

  // 提交评估
  async submitEvaluation() {
    console.log('开始提交评估，录音文件路径:', this.data.tempFilePath);

    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请先录制音频',
        icon: 'none',
      });
      return;
    }

    this.setData({ isSubmitting: true });

    try {
      wx.showLoading({ title: '正在评估...', mask: true });

      // 模拟评估结果（因为后端API还没有实现）
      const mockResult = {
        success: true,
        data: {
          pitch: {
            score: 85,
            grade: '良好',
            details: '音准表现良好，大部分音符准确',
          },
          rhythm: {
            score: 78,
            grade: '中等',
            details: '节奏感不错，但部分节拍略有偏差',
          },
          articulation: {
            score: 92,
            grade: '优秀',
            details: '咬字清晰，发音准确',
          },
          overall: {
            score: 85,
            grade: '良好',
            comment: '整体表现良好，建议继续练习音准和节奏',
          },
        },
      };

      console.log('模拟评估结果:', mockResult);

      wx.hideLoading();

      // 跳转到结果页
      const resultUrl = `../result/result?data=${encodeURIComponent(
        JSON.stringify(mockResult)
      )}`;
      console.log('跳转URL:', resultUrl);

      wx.navigateTo({
        url: resultUrl,
        success: () => {
          console.log('页面跳转成功');
        },
        fail: (error) => {
          console.error('页面跳转失败:', error);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none',
          });
        },
      });
    } catch (error) {
      wx.hideLoading();
      console.error('评估失败:', error);

      wx.showToast({
        title: error.message || '评估失败，请重试',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      this.setData({ isSubmitting: false });
    }
  },
});
