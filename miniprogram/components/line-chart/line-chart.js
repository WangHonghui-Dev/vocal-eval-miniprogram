// components/line-chart/line-chart.js
import * as echarts from '../../ec-canvas/echarts';

let chart = null;

Component({
  properties: {
    chartData: {
      type: Object,
      value: { xAxis: [], series: [] },
      observer: function(newVal) {
        if (newVal && chart) {
          this.updateChart(newVal);
        }
      }
    },
    width: {
      type: String,
      value: '100%'
    },
    height: {
      type: String,
      value: '300rpx'
    },
    title: {
      type: String,
      value: ''
    },
    showMarkPoint: {
      type: Boolean,
      value: true
    },
    showGrid: {
      type: Boolean,
      value: true
    }
  },

  data: {
    ec: {
      onInit: function(canvas, width, height, dpr) {
        chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(chart);

        const option = this.getChartOption(this.data.chartData, this.data);
        chart.setOption(option);

        chart.on('click', (params) => {
          this.triggerEvent('chartClick', {
            dataIndex: params.dataIndex,
            value: params.value,
            name: params.name
          });
        });

        return chart;
      }.bind(this)
    }
  },

  lifetimes: {
    detached() {
      if (chart) {
        chart.dispose();
        chart = null;
      }
    }
  },

  methods: {
    updateChart(data) {
      if (!chart) return;
      const option = this.getChartOption(data, this.data);
      chart.setOption(option, true);
    },

    getChartOption(data, componentData) {
      const { xAxis = [], series = [] } = data;
      const { showMarkPoint, showGrid, title } = componentData;

      let maxValue = -Infinity;
      let minValue = Infinity;
      let maxIndex = 0;
      let minIndex = 0;

      series.forEach((value, index) => {
        if (value > maxValue) {
          maxValue = value;
          maxIndex = index;
        }
        if (value < minValue) {
          minValue = value;
          minIndex = index;
        }
      });

      const markPoints = [];
      if (showMarkPoint && series.length > 0) {
        if (maxValue !== minValue) {
          markPoints.push({
            coord: [maxIndex, maxValue],
            value: maxValue,
            itemStyle: { color: '#e64340' }
          });
          markPoints.push({
            coord: [minIndex, minValue],
            value: minValue,
            itemStyle: { color: '#07C160' }
          });
        } else {
          markPoints.push({
            coord: [0, maxValue],
            value: maxValue,
            itemStyle: { color: '#1890ff' }
          });
        }
      }

      return {
        title: title ? {
          text: title,
          left: 'center',
          top: 10,
          textStyle: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#333'
          }
        } : null,
        
        grid: {
          left: '10%',
          right: '10%',
          top: title ? '15%' : '10%',
          bottom: '15%',
          containLabel: true
        },
        
        xAxis: {
          type: 'category',
          data: xAxis,
          axisLine: {
            lineStyle: { color: '#e8e8e8' }
          },
          axisTick: { show: false },
          axisLabel: {
            color: '#666',
            fontSize: 24
          }
        },
        
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: {
            color: '#666',
            fontSize: 24
          },
          splitLine: showGrid ? {
            lineStyle: {
              color: '#f0f0f0',
              type: 'dashed'
            }
          } : { show: false }
        },
        
        series: [{
          data: series,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: {
            color: '#1890ff',
            width: 3
          },
          itemStyle: {
            color: '#1890ff',
            borderColor: '#fff',
            borderWidth: 2
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [{
                offset: 0,
                color: 'rgba(24, 144, 255, 0.3)'
              }, {
                offset: 1,
                color: 'rgba(24, 144, 255, 0.1)'
              }]
            }
          },
          markPoint: markPoints.length > 0 ? {
            symbol: 'pin',
            symbolSize: 20,
            data: markPoints,
            label: {
              show: true,
              formatter: '{c}',
              fontSize: 24,
              color: '#fff'
            }
          } : null,
          emphasis: {
            itemStyle: {
              color: '#1890ff',
              borderColor: '#fff',
              borderWidth: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(24, 144, 255, 0.5)'
            }
          }
        }],
        
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          borderColor: '#1890ff',
          borderWidth: 1,
          textStyle: {
            color: '#fff',
            fontSize: 28
          },
          formatter: function(params) {
            const data = params[0];
            return `${data.name}<br/>${data.seriesName}: ${data.value}`;
          }
        }
      };
    },

    refreshChart() {
      if (chart) {
        const option = this.getChartOption(this.data.chartData, this.data);
        chart.setOption(option, true);
      }
    },

    getChart() {
      return chart;
    },

    destroyChart() {
      if (chart) {
        chart.dispose();
        chart = null;
      }
    }
  }
});
