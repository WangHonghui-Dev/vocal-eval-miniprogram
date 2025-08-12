// components/audio-player/audio-player.js
Component({
  properties: {
    // 音频源路径（必填）
    src: {
      type: String,
      value: '',
      observer: function(newVal) {
        if (newVal) {
          this.initAudio();
        }
      }
    },
    // 是否自动播放
    autoplay: {
      type: Boolean,
      value: false
    },
    // 是否循环播放
    loop: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isPlaying: false,        // 播放状态
    isMuted: false,          // 静音状态
    currentTime: 0,          // 当前播放时间（秒）
    duration: 0,             // 总时长（秒）
    progress: 0,             // 播放进度（0-100）
    isDragging: false,       // 是否正在拖动进度条
    formattedCurrentTime: '00:00',  // 格式化的当前时间
    formattedDuration: '00:00'      // 格式化的总时长
  },

  lifetimes: {
    attached() {
      this.initAudio();
    },
    detached() {
      this.destroyAudio();
    }
  },

  methods: {
    // 初始化音频
    initAudio() {
      if (!this.properties.src) return;
      
      this.destroyAudio();
      
      this.audioContext = wx.createInnerAudioContext();
      this.audioContext.src = this.properties.src;
      this.audioContext.loop = this.properties.loop;
      this.audioContext.autoplay = this.properties.autoplay;
      
      this.bindAudioEvents();
      
      if (this.properties.autoplay) {
        this.setData({ isPlaying: true });
      }
    },

    // 绑定音频事件
    bindAudioEvents() {
      // 播放开始
      this.audioContext.onPlay(() => {
        this.setData({ isPlaying: true });
        this.triggerEvent('play');
      });

      // 播放暂停
      this.audioContext.onPause(() => {
        this.setData({ isPlaying: false });
        this.triggerEvent('pause');
      });

      // 播放结束
      this.audioContext.onEnded(() => {
        this.setData({ 
          isPlaying: false,
          currentTime: 0,
          progress: 0,
          formattedCurrentTime: '00:00'
        });
        this.triggerEvent('ended');
      });

      // 播放错误
      this.audioContext.onError((error) => {
        console.error('音频播放错误:', error);
        this.setData({ isPlaying: false });
        this.triggerEvent('error', { error });
      });

      // 时间更新
      this.audioContext.onTimeUpdate(() => {
        if (!this.data.isDragging) {
          const currentTime = this.audioContext.currentTime;
          const duration = this.audioContext.duration;
          
          this.setData({
            currentTime,
            duration,
            progress: duration > 0 ? (currentTime / duration) * 100 : 0,
            formattedCurrentTime: this.formatTime(currentTime),
            formattedDuration: this.formatTime(duration)
          });
        }
      });

      // 可以播放
      this.audioContext.onCanplay(() => {
        const duration = this.audioContext.duration;
        this.setData({
          duration,
          formattedDuration: this.formatTime(duration)
        });
      });
    },

    // 播放/暂停切换
    togglePlay() {
      if (!this.audioContext) return;
      
      if (this.data.isPlaying) {
        this.audioContext.pause();
      } else {
        this.audioContext.play();
      }
    },

    // 静音切换
    toggleMute() {
      if (!this.audioContext) return;
      
      const isMuted = !this.data.isMuted;
      this.audioContext.volume = isMuted ? 0 : 1;
      this.setData({ isMuted });
    },

    // 进度条拖动开始
    onSliderChange(e) {
      const value = e.detail.value;
      const duration = this.data.duration;
      const newTime = (value / 100) * duration;
      
      this.setData({
        isDragging: true,
        currentTime: newTime,
        progress: value,
        formattedCurrentTime: this.formatTime(newTime)
      });
    },

    // 进度条拖动结束
    onSliderChanging(e) {
      const value = e.detail.value;
      const duration = this.data.duration;
      const newTime = (value / 100) * duration;
      
      if (this.audioContext) {
        this.audioContext.seek(newTime);
      }
      
      this.setData({
        isDragging: false,
        currentTime: newTime,
        progress: value,
        formattedCurrentTime: this.formatTime(newTime)
      });
    },

    // 格式化时间
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '00:00';
      
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // 销毁音频
    destroyAudio() {
      if (this.audioContext) {
        this.audioContext.destroy();
        this.audioContext = null;
      }
    },

    // 重新播放
    replay() {
      if (this.audioContext) {
        this.audioContext.seek(0);
        this.audioContext.play();
      }
    },

    // 跳转到指定时间
    seekTo(time) {
      if (this.audioContext && time >= 0 && time <= this.data.duration) {
        this.audioContext.seek(time);
      }
    }
  }
});
