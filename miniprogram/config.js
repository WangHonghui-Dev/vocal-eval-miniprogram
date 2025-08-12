// utils/config.js
// 全局配置文件 - 统一管理所有配置项

/**
 * 全局配置对象
 * 所有网络请求必须引用此配置，页面中禁止硬编码URL
 */
const config = {
  // API配置
  api: {
    // API基础地址
    baseURL: 'http://your-server-ip:5000',
    // 请求超时时间（毫秒）
    timeout: 10000,
    // 请求重试次数
    maxRetries: 2,
    // 重试间隔（毫秒）
    retryDelay: 1000
  },

  // 音频配置
  audio: {
    // 最大音频时长（秒）
    maxAudioDuration: 30,
    // 音频格式
    format: 'mp3',
    // 采样率
    sampleRate: 44100,
    // 声道数
    numberOfChannels: 1
  },

  // 缓存配置
  cache: {
    // 歌曲列表缓存时间（毫秒）
    songsCacheDuration: 24 * 60 * 60 * 1000, // 24小时
    // 用户信息缓存时间（毫秒）
    userInfoCacheDuration: 7 * 24 * 60 * 60 * 1000, // 7天
    // 评估历史最大条数
    maxHistoryCount: 50
  },

  // UI配置
  ui: {
    // 主题色
    primaryColor: '#1890ff',
    // 成功色
    successColor: '#07C160',
    // 警告色
    warningColor: '#faad14',
    // 错误色
    errorColor: '#e64340',
    // 文字主色
    textPrimary: '#333333',
    // 文字辅助色
    textSecondary: '#999999',
    // 背景色
    backgroundColor: '#f6f6f6'
  },

  // 功能开关
  features: {
    // 是否启用自动播放
    autoPlay: false,
    // 是否启用循环播放
    loopPlay: false,
    // 是否启用音频缓存
    audioCache: true,
    // 是否启用错误重试
    errorRetry: true,
    // 是否启用调试模式
    debug: false
  },

  // 错误消息
  messages: {
    // 网络错误
    networkError: '网络连接失败，请重试',
    // 超时错误
    timeoutError: '请求超时，请重试',
    // 音频文件过大
    audioTooLarge: '音频文件过大（限制30秒）',
    // 服务器错误
    serverError: '服务器处理失败',
    // 未授权
    unauthorized: '未授权，请重新登录',
    // 录音失败
    recordError: '录音失败，请检查麦克风权限',
    // 播放失败
    playError: '音频播放失败',
    // 评估失败
    evaluateError: '评估失败，请重试'
  },

  // 状态码映射
  statusCodes: {
    200: '请求成功',
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '禁止访问',
    404: '资源不存在',
    413: '音频文件过大（限制30秒）',
    500: '服务器处理失败',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时'
  }
};

/**
 * 获取API完整URL
 * @param {string} path - API路径
 * @returns {string} 完整的API URL
 */
function getApiUrl(path) {
  const baseURL = config.api.baseURL.replace(/\/$/, '');
  const apiPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseURL}${apiPath}`;
}

/**
 * 获取配置项
 * @param {string} key - 配置键，支持点号分隔的嵌套键
 * @returns {any} 配置值
 */
function getConfig(key) {
  const keys = key.split('.');
  let value = config;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
}

/**
 * 设置配置项
 * @param {string} key - 配置键，支持点号分隔的嵌套键
 * @param {any} value - 配置值
 */
function setConfig(key, value) {
  const keys = key.split('.');
  const lastKey = keys.pop();
  let target = config;
  
  for (const k of keys) {
    if (!target[k] || typeof target[k] !== 'object') {
      target[k] = {};
    }
    target = target[k];
  }
  
  target[lastKey] = value;
}

/**
 * 检查是否为开发环境
 * @returns {boolean} 是否为开发环境
 */
function isDevelopment() {
  return config.features.debug;
}

/**
 * 获取错误消息
 * @param {string|number} key - 错误键或状态码
 * @returns {string} 错误消息
 */
function getErrorMessage(key) {
  // 如果是状态码
  if (typeof key === 'number') {
    return config.statusCodes[key] || config.messages.serverError;
  }
  
  // 如果是错误键
  return config.messages[key] || '未知错误';
}

// 导出配置对象和工具函数
module.exports = {
  // 配置对象
  ...config,
  
  // 工具函数
  getApiUrl,
  getConfig,
  setConfig,
  isDevelopment,
  getErrorMessage
};
