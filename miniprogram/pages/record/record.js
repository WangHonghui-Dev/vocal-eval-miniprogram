import { evaluateVocal } from '../../utils/api'

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
  },

  onLoad(options) {
    // 获取从首页传入的歌曲信息
    const { songId } = options
    this.setData({ songId })
    
    // 这里应该根据songId获取歌曲详情，暂时使用模拟数据
    this.loadSongInfo(songId)
  },

  onUnload() {
    // 页面卸载时清理计时器
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer)
    }
  },

  // 加载歌曲信息
  loadSongInfo(songId) {
    // 模拟获取歌曲信息，实际应该调用API
    const songInfo = {
      name: '月亮代表我的心',
      artist: '邓丽君'
    }
    this.setData({
      songName: songInfo.name,
      artist: songInfo.artist
    })
  },

  // 开始录音
  startRecord() {
    const that = this
    
    // 检查录音权限
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          wx.authorize({
            scope: 'scope.record',
            success() {
              that.doStartRecord()
            },
            fail() {
              wx.showToast({
                title: '需要录音权限，请在设置中开启',
                icon: 'none',
                duration: 2000
              })
            }
          })
        } else {
          that.doStartRecord()
        }
      }
    })
  },

  // 执行开始录音
  doStartRecord() {
    const that = this
    
    wx.startRecord({
      success(res) {
        that.setData({
          isRecording: true,
          recordDuration: 0,
          tempFilePath: '',
          hasRecorded: false
        })
        
        // 启动计时器
        const timer = setInterval(() => {
          that.setData({
            recordDuration: that.data.recordDuration + 1
          })
        }, 1000)
        
        that.setData({ recordTimer: timer })
        
        wx.showToast({
          title: '开始录音',
          icon: 'success'
        })
      },
      fail(error) {
        console.error('录音失败:', error)
        wx.showToast({
          title: '录音失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 停止录音
  stopRecord() {
    const that = this
    
    wx.stopRecord({
      success(res) {
        // 清理计时器
        if (that.data.recordTimer) {
          clearInterval(that.data.recordTimer)
        }
        
        that.setData({
          isRecording: false,
          recordTimer: null,
          tempFilePath: res.tempFilePath,
          hasRecorded: true
        })
        
        wx.showToast({
          title: '录音完成',
          icon: 'success'
        })
      },
      fail(error) {
        console.error('停止录音失败:', error)
        wx.showToast({
          title: '停止录音失败',
          icon: 'none'
        })
      }
    })
  },

  // 录音按钮点击
  handleRecordClick() {
    if (this.data.isRecording) {
      this.stopRecord()
    } else {
      this.startRecord()
    }
  },

  // 重新录制
  retryRecord() {
    this.setData({
      tempFilePath: '',
      hasRecorded: false,
      recordDuration: 0
    })
  },

  // 格式化时间显示
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  // 提交评估
  async submitEvaluation() {
    if (!this.data.tempFilePath) {
      wx.showToast({
        title: '请先录制音频',
        icon: 'none'
      })
      return
    }

    this.setData({ isSubmitting: true })
    
    try {
      wx.showLoading({ title: '正在评估...', mask: true })
      
      const result = await evaluateVocal({
        songId: this.data.songId,
        audioFile: this.data.tempFilePath
      })
      
      wx.hideLoading()
      
      // 跳转到结果页
      wx.navigateTo({
        url: `../result/result?data=${encodeURIComponent(JSON.stringify(result))}`
      })
      
    } catch (error) {
      wx.hideLoading()
      console.error('评估失败:', error)
      
      wx.showToast({
        title: error.message || '评估失败，请重试',
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ isSubmitting: false })
    }
  },
})
