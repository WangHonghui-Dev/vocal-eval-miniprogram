// components/result-card/result-card.js
Component({
  properties: {
    // 卡片标题
    title: {
      type: String,
      value: ''
    },
    // 评分数值（0-100）
    score: {
      type: Number,
      value: 0
    },
    // 详细数据
    data: {
      type: Object,
      value: {}
    }
  },

  data: {
    isExpanded: false,        // 是否展开
    grade: '',               // 评级文字
    gradeColor: '',          // 评级颜色
    progressColor: '',       // 进度条颜色
    chartData: []            // 图表数据
  },

  observers: {
    'score': function(score) {
      this.calculateGrade(score);
    },
    'data': function(data) {
      this.processChartData(data);
    }
  },

  methods: {
    // 计算评级和颜色
    calculateGrade(score) {
      let grade, color;
      
      if (score >= 90) {
        grade = '优秀';
        color = '#07C160';  // 绿色
      } else if (score >= 80) {
        grade = '良好';
        color = '#1890ff';  // 蓝色
      } else if (score >= 70) {
        grade = '一般';
        color = '#faad14';  // 橙色
      } else if (score >= 60) {
        grade = '及格';
        color = '#ff7a45';  // 红橙色
      } else {
        grade = '需改进';
        color = '#e64340';  // 红色
      }
      
      this.setData({
        grade,
        gradeColor: color,
        progressColor: color
      });
    },

    // 处理图表数据
    processChartData(data) {
      if (!data || typeof data !== 'object') {
        this.setData({ chartData: [] });
        return;
      }

      // 根据数据类型处理图表数据
      let chartData = [];
      
      if (Array.isArray(data.deviations)) {
        // 音准偏差数据
        chartData = data.deviations.map((deviation, index) => ({
          x: index,
          y: deviation,
          label: `${index + 1}s`
        }));
      } else if (Array.isArray(data.rhythm)) {
        // 节奏数据
        chartData = data.rhythm.map((item, index) => ({
          x: index,
          y: item.accuracy,
          label: item.note
        }));
      } else if (Array.isArray(data.articulation)) {
        // 咬字数据
        chartData = data.articulation.map((item, index) => ({
          x: index,
          y: item.clarity,
          label: item.word
        }));
      }

      this.setData({ chartData });
    },

    // 切换展开状态
    toggleExpand() {
      const isExpanded = !this.data.isExpanded;
      this.setData({ isExpanded });
      
      // 触发展开状态变化事件
      this.triggerEvent('expand', { isExpanded });
    },

    // 获取进度条样式
    getProgressStyle() {
      const { score } = this.properties;
      const { progressColor } = this.data;
      
      return {
        background: `conic-gradient(${progressColor} ${score * 3.6}deg, #f0f0f0 0deg)`
      };
    },

    // 获取评分显示样式
    getScoreStyle() {
      const { score } = this.properties;
      const { gradeColor } = this.data;
      
      return {
        color: gradeColor,
        fontSize: score >= 100 ? '32rpx' : '36rpx'
      };
    },

    // 格式化评分显示
    formatScore() {
      const { score } = this.properties;
      return Math.round(score);
    },

    // 获取详细分析文本
    getAnalysisText() {
      const { score } = this.properties;
      const { grade } = this.data;
      const { title } = this.properties;
      
      let analysis = '';
      
      if (title.includes('音准')) {
        if (score >= 90) {
          analysis = '您的音准控制非常出色，能够准确把握音高，音程关系清晰。';
        } else if (score >= 80) {
          analysis = '您的音准表现良好，大部分音高准确，偶有轻微偏差。';
        } else if (score >= 70) {
          analysis = '您的音准基本准确，但存在一些偏差，建议加强音高训练。';
        } else {
          analysis = '您的音准需要改进，建议进行系统的音高训练和听力练习。';
        }
      } else if (title.includes('节奏')) {
        if (score >= 90) {
          analysis = '您的节奏感极佳，能够准确把握节拍和时值。';
        } else if (score >= 80) {
          analysis = '您的节奏表现良好，基本能够保持稳定的节拍。';
        } else if (score >= 70) {
          analysis = '您的节奏基本准确，但需要加强节拍稳定性训练。';
        } else {
          analysis = '您的节奏需要改进，建议进行节拍训练和节奏练习。';
        }
      } else if (title.includes('咬字')) {
        if (score >= 90) {
          analysis = '您的咬字清晰准确，发音标准，吐字有力。';
        } else if (score >= 80) {
          analysis = '您的咬字表现良好，发音基本清晰，偶有模糊。';
        } else if (score >= 70) {
          analysis = '您的咬字基本清晰，但需要加强发音练习。';
        } else {
          analysis = '您的咬字需要改进，建议进行发音训练和口腔练习。';
        }
      }
      
      return analysis;
    }
  }
});
