// app.js
App({
  globalData: {
    userInfo: null, // 用户信息
    audioContext: null, // 音频播放上下文
    history: [], // 评估历史记录
    openid: null, // 用户openid
    isLoggedIn: false, // 登录状态
  },

  onLaunch() {
    console.log('小程序启动');
    this.initAudioContext();
    this.initLogin();
    this.setupGlobalErrorHandler();
    this.loadHistory();
  },

  onShow() {
    console.log('小程序显示');
    this.checkLoginStatus();
    this.resumeAudioIfNeeded();
  },

  onHide() {
    console.log('小程序隐藏');
    this.pauseAllAudio();
    this.saveHistory();
  },

  initAudioContext() {
    try {
      this.globalData.audioContext = wx.createInnerAudioContext();
      this.globalData.audioContext.onPlay(() => {
        console.log('音频开始播放');
      });
      this.globalData.audioContext.onEnded(() => {
        console.log('音频播放结束');
      });
      this.globalData.audioContext.onError((error) => {
        console.error('音频播放错误:', error);
        wx.showToast({
          title: '音频播放失败',
          icon: 'error',
        });
      });
      console.log('音频上下文初始化成功');
    } catch (error) {
      console.error('音频上下文初始化失败:', error);
    }
  },

  initLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          console.log('获取登录code成功:', res.code);
          this.getOpenid(res.code);
        } else {
          console.error('获取登录code失败');
        }
      },
      fail: (error) => {
        console.error('wx.login失败:', error);
      },
    });
  },

  getOpenid(code) {
    console.log('发送code到后端:', code);
    setTimeout(() => {
      const mockOpenid = 'mock_openid_' + Date.now();
      this.globalData.openid = mockOpenid;
      this.globalData.isLoggedIn = true;
      wx.setStorageSync('openid', mockOpenid);
      wx.setStorageSync('isLoggedIn', true);
      console.log('登录成功，openid:', mockOpenid);
      this.onLoginSuccess();
    }, 1000);
  },

  onLoginSuccess() {
    console.log('用户登录成功');
  },

  checkLoginStatus() {
    try {
      const openid = wx.getStorageSync('openid');
      const isLoggedIn = wx.getStorageSync('isLoggedIn');
      if (openid && isLoggedIn) {
        this.globalData.openid = openid;
        this.globalData.isLoggedIn = true;
        console.log('用户已登录');
      } else {
        console.log('用户未登录，重新初始化登录');
        this.initLogin();
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },

  pauseAllAudio() {
    if (this.globalData.audioContext) {
      try {
        this.globalData.audioContext.pause();
        console.log('音频已暂停');
      } catch (error) {
        console.error('暂停音频失败:', error);
      }
    }
  },

  resumeAudioIfNeeded() {
    console.log('检查是否需要恢复音频播放');
  },

  setupGlobalErrorHandler() {
    wx.onUnhandledRejection((res) => {
      console.error('未处理错误:', res.reason);
      wx.showToast({
        title: '程序异常',
        icon: 'error',
        duration: 2000,
      });
    });

    wx.onError((error) => {
      console.error('全局错误:', error);
      wx.showToast({
        title: '程序错误',
        icon: 'error',
        duration: 2000,
      });
    });
  },

  loadHistory() {
    try {
      const history = wx.getStorageSync('evaluation_history');
      if (history && Array.isArray(history)) {
        this.globalData.history = history;
        console.log('历史记录加载成功，共', history.length, '条');
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  },

  saveHistory() {
    try {
      wx.setStorageSync('evaluation_history', this.globalData.history);
      console.log('历史记录保存成功');
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  addHistoryRecord(record) {
    if (!record) return;
    record.timestamp = Date.now();
    record.id = 'eval_' + Date.now();
    this.globalData.history.unshift(record);
    if (this.globalData.history.length > 50) {
      this.globalData.history = this.globalData.history.slice(0, 50);
    }
    this.saveHistory();
    console.log('添加评估历史:', record);
  },

  clearHistory() {
    this.globalData.history = [];
    wx.removeStorageSync('evaluation_history');
    console.log('历史记录已清除');
  },

  getUserInfo() {
    return this.globalData.userInfo;
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  isLoggedIn() {
    return this.globalData.isLoggedIn && !!this.globalData.openid;
  },

  logout() {
    this.globalData.userInfo = null;
    this.globalData.openid = null;
    this.globalData.isLoggedIn = false;
    wx.removeStorageSync('openid');
    wx.removeStorageSync('isLoggedIn');
    wx.removeStorageSync('userInfo');
    console.log('用户已退出登录');
  },
});
