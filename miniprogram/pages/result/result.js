// 暂时移除 ECharts 依赖，使用简化版本
let chart = null;

function initChart(canvas, width, height, dpr) {
  // 简化版本，暂时不显示图表
  console.log('图表初始化（简化版）');
  return null;
}

Page({
  data: {
    ec: {
      onInit: initChart,
    },
    resultData: null,
    totalScore: 0,
    scoreLevel: '',
    scoreColor: '',
    pitchData: [],
    rhythmData: [],
    articulationData: {},
    suggestions: [],
    isLoading: true,
  },

  onLoad(options) {
    try {
      // 解析传入的评估结果数据
      const { data } = options;
      if (data) {
        const resultData = JSON.parse(decodeURIComponent(data));
        this.processResultData(resultData);
      } else {
        // 使用模拟数据
        this.loadMockData();
      }
    } catch (error) {
      console.error('解析结果数据失败:', error);
      this.loadMockData();
    }
  },

  // 处理评估结果数据
  processResultData(data) {
    const totalScore = this.calculateTotalScore(data);
    const scoreLevel = this.getScoreLevel(totalScore);
    const scoreColor = this.getScoreColor(totalScore);

    this.setData({
      resultData: data,
      totalScore,
      scoreLevel,
      scoreColor,
      isLoading: false,
    });

    // 初始化图表数据
    this.initChartData(data);
    this.generateSuggestions(data);
  },

  // 计算总分
  calculateTotalScore(data) {
    // 处理新的数据结构
    if (data.data && data.data.overall) {
      return data.data.overall.score || 0;
    }

    // 处理旧的数据结构
    const { pitch = 0, rhythm = 0, articulation = 0 } = data;
    return Math.round((pitch + rhythm + articulation) / 3);
  },

  // 获取评分等级
  getScoreLevel(score) {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 60) return '合格';
    return '待提高';
  },

  // 获取评分颜色
  getScoreColor(score) {
    if (score >= 90) return '#FFD700'; // 金色
    if (score >= 80) return '#07C160'; // 绿色
    if (score >= 60) return '#1890ff'; // 蓝色
    return '#e64340'; // 红色
  },

  // 初始化图表数据
  initChartData(data) {
    // 处理新的数据结构
    let pitchScore = 75;
    let rhythmScore = 80;
    let articulationScore = 70;

    if (data.data) {
      pitchScore = data.data.pitch?.score || 75;
      rhythmScore = data.data.rhythm?.score || 80;
      articulationScore = data.data.articulation?.score || 70;
    } else {
      // 处理旧的数据结构
      pitchScore = data.pitch || 75;
      rhythmScore = data.rhythm || 80;
      articulationScore = data.articulation || 70;
    }

    // 音准数据
    const pitchData = this.generatePitchData(pitchScore);
    this.setData({ pitchData });

    // 节奏数据
    const rhythmData = this.generateRhythmData(rhythmScore);
    this.setData({ rhythmData });

    // 咬字数据
    const articulationData = this.generateArticulationData(articulationScore);
    this.setData({ articulationData });

    // 更新图表
    this.updateChart(pitchData);
  },

  // 生成音准数据
  generatePitchData(score) {
    const data = [];
    const maxDeviation = (100 - score) / 10; // 最大偏差
    const timePoints = 50;

    for (let i = 0; i < timePoints; i++) {
      const time = ((i / timePoints) * 10).toFixed(1);
      const deviation = (Math.random() - 0.5) * maxDeviation * 2;
      data.push([time, parseFloat(deviation.toFixed(2))]);
    }

    return {
      data,
      maxDeviation: Math.max(...data.map((item) => Math.abs(item[1]))),
      avgDeviation:
        data.reduce((sum, item) => sum + Math.abs(item[1]), 0) / data.length,
    };
  },

  // 生成节奏数据
  generateRhythmData(score) {
    const bpmError = (100 - score) / 2;
    const heatmapData = [];

    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 8; j++) {
        const error = (Math.random() * (100 - score)) / 10;
        heatmapData.push([i, j, error]);
      }
    }

    return {
      bpmError: bpmError.toFixed(1),
      heatmapData,
    };
  },

  // 生成咬字数据
  generateArticulationData(score) {
    const baseScore = score;
    return {
      consonant: Math.max(0, baseScore - Math.random() * 20),
      vowel: Math.max(0, baseScore - Math.random() * 15),
      clarity: Math.max(0, baseScore - Math.random() * 10),
      fluency: Math.max(0, baseScore - Math.random() * 25),
    };
  },

  // 更新图表（简化版）
  updateChart(pitchData) {
    // 暂时不更新图表
    console.log('图表数据更新（简化版）:', pitchData);
  },

  // 生成训练建议
  generateSuggestions(data) {
    const suggestions = [];

    // 处理新的数据结构
    let pitchScore = 75;
    let rhythmScore = 80;
    let articulationScore = 70;

    if (data.data) {
      pitchScore = data.data.pitch?.score || 75;
      rhythmScore = data.data.rhythm?.score || 80;
      articulationScore = data.data.articulation?.score || 70;
    } else {
      // 处理旧的数据结构
      pitchScore = data.pitch || 75;
      rhythmScore = data.rhythm || 80;
      articulationScore = data.articulation || 70;
    }

    if (pitchScore < 80) {
      suggestions.push({
        title: '音准训练',
        content: '建议加强长音练习，改善呼吸稳定性',
        icon: '🎵',
        priority: 'high',
      });
    }

    if (rhythmScore < 80) {
      suggestions.push({
        title: '节奏训练',
        content: '建议使用节拍器练习，提高节奏感',
        icon: '⏰',
        priority: 'medium',
      });
    }

    if (articulationScore < 80) {
      suggestions.push({
        title: '咬字训练',
        content: '建议练习绕口令，提高发音清晰度',
        icon: '🗣️',
        priority: 'medium',
      });
    }

    if (suggestions.length === 0) {
      suggestions.push({
        title: '保持练习',
        content: '表现很好，建议继续保持日常练习',
        icon: '🌟',
        priority: 'low',
      });
    }

    this.setData({ suggestions });
  },

  // 加载模拟数据
  loadMockData() {
    const mockData = {
      pitch: 85,
      rhythm: 78,
      articulation: 82,
      details: {
        pitchAccuracy: 0.85,
        rhythmConsistency: 0.78,
        articulationClarity: 0.82,
      },
    };
    this.processResultData(mockData);
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 重新测试
  retest() {
    wx.showModal({
      title: '确认重新测试',
      content: '确定要重新进行声乐评估吗？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/index/index',
          });
        }
      },
    });
  },

  // 保存报告
  saveReport() {
    wx.showLoading({ title: '保存中...' });

    // 模拟保存过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '报告已保存',
        icon: 'success',
      });
    }, 1500);
  },

  // 分享结果
  onShareAppMessage() {
    return {
      title: `我的声乐评估得分：${this.data.totalScore}分`,
      path: '/pages/index/index',
    };
  },
});
