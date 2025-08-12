import * as echarts from '../../components/ec-canvas/echarts'

let chart = null

function initChart(canvas, width, height, dpr) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  })
  canvas.setChart(chart)

  const option = {
    grid: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '音高偏差(半音)',
      nameTextStyle: { color: '#666', fontSize: 10 },
      axisLine: { lineStyle: { color: '#ddd' } },
      axisLabel: { color: '#666', fontSize: 10 },
      splitLine: { lineStyle: { color: '#f0f0f0' } }
    },
    series: [{
      type: 'line',
      data: [],
      smooth: true,
      lineStyle: { color: '#1890ff', width: 2 },
      areaStyle: { color: 'rgba(24, 144, 255, 0.1)' },
      symbol: 'circle',
      symbolSize: 4
    }]
  }
  chart.setOption(option)
  return chart
}

Page({
  data: {
    ec: {
      onInit: initChart
    },
    resultData: null,
    totalScore: 0,
    scoreLevel: '',
    scoreColor: '',
    pitchData: [],
    rhythmData: [],
    articulationData: {},
    suggestions: [],
    isLoading: true
  },

  onLoad(options) {
    try {
      // 解析传入的评估结果数据
      const { data } = options
      if (data) {
        const resultData = JSON.parse(decodeURIComponent(data))
        this.processResultData(resultData)
      } else {
        // 使用模拟数据
        this.loadMockData()
      }
    } catch (error) {
      console.error('解析结果数据失败:', error)
      this.loadMockData()
    }
  },

  // 处理评估结果数据
  processResultData(data) {
    const totalScore = this.calculateTotalScore(data)
    const scoreLevel = this.getScoreLevel(totalScore)
    const scoreColor = this.getScoreColor(totalScore)
    
    this.setData({
      resultData: data,
      totalScore,
      scoreLevel,
      scoreColor,
      isLoading: false
    })

    // 初始化图表数据
    this.initChartData(data)
    this.generateSuggestions(data)
  },

  // 计算总分
  calculateTotalScore(data) {
    const { pitch = 0, rhythm = 0, articulation = 0 } = data
    return Math.round((pitch + rhythm + articulation) / 3)
  },

  // 获取评分等级
  getScoreLevel(score) {
    if (score >= 90) return '优秀'
    if (score >= 80) return '良好'
    if (score >= 60) return '合格'
    return '待提高'
  },

  // 获取评分颜色
  getScoreColor(score) {
    if (score >= 90) return '#FFD700' // 金色
    if (score >= 80) return '#07C160' // 绿色
    if (score >= 60) return '#1890ff' // 蓝色
    return '#e64340' // 红色
  },

  // 初始化图表数据
  initChartData(data) {
    // 音准数据
    const pitchData = this.generatePitchData(data.pitch || 75)
    this.setData({ pitchData })
    
    // 节奏数据
    const rhythmData = this.generateRhythmData(data.rhythm || 80)
    this.setData({ rhythmData })
    
    // 咬字数据
    const articulationData = this.generateArticulationData(data.articulation || 70)
    this.setData({ articulationData })

    // 更新图表
    this.updateChart(pitchData)
  },

  // 生成音准数据
  generatePitchData(score) {
    const data = []
    const maxDeviation = (100 - score) / 10 // 最大偏差
    const timePoints = 50
    
    for (let i = 0; i < timePoints; i++) {
      const time = (i / timePoints * 10).toFixed(1)
      const deviation = (Math.random() - 0.5) * maxDeviation * 2
      data.push([time, parseFloat(deviation.toFixed(2))])
    }
    
    return {
      data,
      maxDeviation: Math.max(...data.map(item => Math.abs(item[1]))),
      avgDeviation: data.reduce((sum, item) => sum + Math.abs(item[1]), 0) / data.length
    }
  },

  // 生成节奏数据
  generateRhythmData(score) {
    const bpmError = (100 - score) / 2
    const heatmapData = []
    
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 8; j++) {
        const error = Math.random() * (100 - score) / 10
        heatmapData.push([i, j, error])
      }
    }
    
    return {
      bpmError: bpmError.toFixed(1),
      heatmapData
    }
  },

  // 生成咬字数据
  generateArticulationData(score) {
    const baseScore = score
    return {
      consonant: Math.max(0, baseScore - Math.random() * 20),
      vowel: Math.max(0, baseScore - Math.random() * 15),
      clarity: Math.max(0, baseScore - Math.random() * 10),
      fluency: Math.max(0, baseScore - Math.random() * 25)
    }
  },

  // 更新图表
  updateChart(pitchData) {
    if (chart) {
      const option = {
        xAxis: {
          data: pitchData.data.map(item => item[0])
        },
        series: [{
          data: pitchData.data.map(item => item[1])
        }]
      }
      chart.setOption(option)
    }
  },

  // 生成训练建议
  generateSuggestions(data) {
    const suggestions = []
    const { pitch = 0, rhythm = 0, articulation = 0 } = data
    
    if (pitch < 80) {
      suggestions.push({
        title: '音准训练',
        content: '建议加强长音练习，改善呼吸稳定性',
        icon: '/images/breath-icon.png',
        priority: 'high'
      })
    }
    
    if (rhythm < 80) {
      suggestions.push({
        title: '节奏训练',
        content: '建议使用节拍器练习，提高节奏感',
        icon: '/images/rhythm-icon.png',
        priority: 'medium'
      })
    }
    
    if (articulation < 80) {
      suggestions.push({
        title: '咬字训练',
        content: '建议练习绕口令，提高发音清晰度',
        icon: '/images/articulation-icon.png',
        priority: 'medium'
      })
    }
    
    if (suggestions.length === 0) {
      suggestions.push({
        title: '保持练习',
        content: '表现很好，建议继续保持日常练习',
        icon: '/images/practice-icon.png',
        priority: 'low'
      })
    }
    
    this.setData({ suggestions })
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
        articulationClarity: 0.82
      }
    }
    this.processResultData(mockData)
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  },

  // 重新测试
  retest() {
    wx.showModal({
      title: '确认重新测试',
      content: '确定要重新进行声乐评估吗？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  // 保存报告
  saveReport() {
    wx.showLoading({ title: '保存中...' })
    
    // 模拟保存过程
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({
        title: '报告已保存',
        icon: 'success'
      })
    }, 1500)
  },

  // 分享结果
  onShareAppMessage() {
    return {
      title: `我的声乐评估得分：${this.data.totalScore}分`,
      path: '/pages/index/index'
    }
  }
})
