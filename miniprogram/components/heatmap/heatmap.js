// components/heatmap/heatmap.js
Component({
  properties: {
    // 热力图数据（二维数组）
    data: {
      type: Array,
      value: [],
      observer: function(newVal) {
        this.processData(newVal);
      }
    },
    // 时间轴标签
    timeLabels: {
      type: Array,
      value: []
    },
    // 节拍轴标签
    beatLabels: {
      type: Array,
      value: []
    },
    // 单元格最小尺寸
    cellSize: {
      type: Number,
      value: 40
    },
    // 是否显示图例
    showLegend: {
      type: Boolean,
      value: true
    },
    // 是否支持缩放
    enableZoom: {
      type: Boolean,
      value: true
    }
  },

  data: {
    processedData: [],        // 处理后的数据
    maxValue: 0,              // 最大值
    minValue: 0,              // 最小值
    cellWidth: 40,            // 单元格宽度
    cellHeight: 40,           // 单元格高度
    scale: 1,                 // 缩放比例
    isZoomed: false,          // 是否处于缩放状态
    selectedCell: null,       // 选中的单元格
    showTooltip: false,       // 是否显示提示框
    tooltipData: null,        // 提示框数据
    tooltipPosition: {        // 提示框位置
      x: 0,
      y: 0
    }
  },

  lifetimes: {
    attached() {
      this.initHeatmap();
    }
  },

  methods: {
    // 初始化热力图
    initHeatmap() {
      this.processData(this.properties.data);
      this.calculateCellSize();
    },

    // 处理数据
    processData(data) {
      if (!Array.isArray(data) || data.length === 0) {
        this.setData({
          processedData: [],
          maxValue: 0,
          minValue: 0
        });
        return;
      }

      let maxValue = -Infinity;
      let minValue = Infinity;

      // 计算最大值和最小值
      data.forEach(row => {
        if (Array.isArray(row)) {
          row.forEach(value => {
            if (typeof value === 'number') {
              maxValue = Math.max(maxValue, value);
              minValue = Math.min(minValue, value);
            }
          });
        }
      });

      this.setData({
        processedData: data,
        maxValue,
        minValue
      });
    },

    // 计算单元格尺寸
    calculateCellSize() {
      const { data, cellSize } = this.properties;
      if (!data || data.length === 0) return;

      const containerWidth = 750; // 假设容器宽度
      const containerHeight = 400; // 假设容器高度
      
      const cols = data[0] ? data[0].length : 0;
      const rows = data.length;

      const cellWidth = Math.max(cellSize, containerWidth / cols);
      const cellHeight = Math.max(cellSize, containerHeight / rows);

      this.setData({
        cellWidth,
        cellHeight
      });
    },

    // 获取单元格颜色
    getCellColor(value) {
      const { maxValue, minValue } = this.data;
      if (maxValue === minValue) return '#07C160';

      const ratio = (value - minValue) / (maxValue - minValue);
      
      // 颜色梯度：绿色 → 黄色 → 红色
      if (ratio <= 0.5) {
        // 绿色到黄色
        const greenRatio = ratio * 2;
        const red = Math.round(255 * greenRatio);
        const green = 255;
        const blue = 0;
        return `rgb(${red}, ${green}, ${blue})`;
      } else {
        // 黄色到红色
        const redRatio = (ratio - 0.5) * 2;
        const red = 255;
        const green = Math.round(255 * (1 - redRatio));
        const blue = 0;
        return `rgb(${red}, ${green}, ${blue})`;
      }
    },

    // 单元格点击事件
    onCellTap(e) {
      const { row, col, value } = e.currentTarget.dataset;
      const { timeLabels, beatLabels } = this.properties;
      
      const timeLabel = timeLabels[col] || `时间${col + 1}`;
      const beatLabel = beatLabels[row] || `节拍${row + 1}`;
      
      this.triggerEvent('cellClick', {
        row,
        col,
        value,
        timeLabel,
        beatLabel
      });
    },

    // 单元格长按事件
    onCellLongPress(e) {
      const { row, col, value } = e.currentTarget.dataset;
      const { timeLabels, beatLabels } = this.properties;
      
      const timeLabel = timeLabels[col] || `时间${col + 1}`;
      const beatLabel = beatLabels[row] || `节拍${row + 1}`;
      
      // 显示提示框
      this.setData({
        showTooltip: true,
        tooltipData: {
          row,
          col,
          value,
          timeLabel,
          beatLabel
        },
        tooltipPosition: {
          x: e.detail.x,
          y: e.detail.y
        }
      });

      // 3秒后自动隐藏提示框
      setTimeout(() => {
        this.setData({
          showTooltip: false,
          tooltipData: null
        });
      }, 3000);
    },

    // 隐藏提示框
    hideTooltip() {
      this.setData({
        showTooltip: false,
        tooltipData: null
      });
    },

    // 缩放功能
    onZoom(e) {
      if (!this.properties.enableZoom) return;
      
      const { scale } = e.detail;
      const newScale = Math.max(0.5, Math.min(3, scale));
      
      this.setData({
        scale: newScale,
        isZoomed: newScale !== 1
      });
    },

    // 重置缩放
    resetZoom() {
      this.setData({
        scale: 1,
        isZoomed: false
      });
    },

    // 获取单元格样式
    getCellStyle(value, row, col) {
      const { cellWidth, cellHeight, scale } = this.data;
      const color = this.getCellColor(value);
      
      return {
        width: `${cellWidth * scale}rpx`,
        height: `${cellHeight * scale}rpx`,
        backgroundColor: color,
        border: '1rpx solid rgba(255, 255, 255, 0.3)'
      };
    },

    // 获取图例颜色
    getLegendColors() {
      const colors = [];
      const steps = 10;
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        colors.push(this.getCellColor(ratio));
      }
      
      return colors;
    },

    // 获取图例标签
    getLegendLabels() {
      const { maxValue, minValue } = this.data;
      const steps = 5;
      const labels = [];
      
      for (let i = 0; i <= steps; i++) {
        const value = minValue + (maxValue - minValue) * (i / steps);
        labels.push(value.toFixed(2));
      }
      
      return labels;
    }
  }
});
