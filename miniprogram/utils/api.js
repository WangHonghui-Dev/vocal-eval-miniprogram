// API 基础配置
const BASE_URL = 'http://your-server-ip:5000';
const TIMEOUT = 10000; // 10秒超时
const MAX_RETRIES = 2; // 最大重试次数

// 缓存配置
const CACHE_KEY_SONGS = 'reference_songs_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {Object} options - 请求选项
 * @param {number} retryCount - 重试次数
 * @returns {Promise} 请求结果
 */
function request(url, options = {}, retryCount = 0) {
  return new Promise((resolve, reject) => {
    const requestTask = wx.request({
      url: `${BASE_URL}${url}`,
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'multipart/form-data',
        ...options.header
      },
      ...options,
      success: (res) => {
        // 处理HTTP状态码
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          const errorMessage = getErrorMessage(res.statusCode);
          reject(new Error(errorMessage));
        }
      },
      fail: (error) => {
        // 网络错误处理
        if (retryCount < MAX_RETRIES) {
          console.log(`请求失败，${1000 * (retryCount + 1)}ms后重试...`);
          setTimeout(() => {
            request(url, options, retryCount + 1)
              .then(resolve)
              .catch(reject);
          }, 1000 * (retryCount + 1));
        } else {
          reject(new Error('网络连接失败，请重试'));
        }
      }
    });

    // 超时处理
    setTimeout(() => {
      requestTask.abort();
      reject(new Error('请求超时，请重试'));
    }, TIMEOUT);
  });
}

/**
 * 获取错误信息
 * @param {number} statusCode - HTTP状态码
 * @returns {string} 错误信息
 */
function getErrorMessage(statusCode) {
  const errorMap = {
    401: '未授权，请重新登录',
    413: '音频文件过大（限制30秒）',
    500: '服务器处理失败'
  };
  return errorMap[statusCode] || `请求失败 (${statusCode})`;
}

/**
 * 检查缓存是否有效
 * @param {string} key - 缓存键
 * @returns {boolean} 是否有效
 */
function isCacheValid(key) {
  try {
    const cache = wx.getStorageSync(key);
    if (!cache) return false;
    
    const now = Date.now();
    return (now - cache.timestamp) < CACHE_DURATION;
  } catch (error) {
    console.error('缓存检查失败:', error);
    return false;
  }
}

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} data - 缓存数据
 */
function setCache(key, data) {
  try {
    wx.setStorageSync(key, {
      data,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('缓存设置失败:', error);
  }
}

/**
 * 获取缓存数据
 * @param {string} key - 缓存键
 * @returns {any} 缓存数据
 */
function getCache(key) {
  try {
    const cache = wx.getStorageSync(key);
    return cache ? cache.data : null;
  } catch (error) {
    console.error('缓存获取失败:', error);
    return null;
  }
}

/**
 * 获取参考歌曲列表
 * @returns {Promise<Object>} 歌曲列表
 */
export function getReferenceSongs() {
  return new Promise((resolve, reject) => {
    // 检查缓存
    if (isCacheValid(CACHE_KEY_SONGS)) {
      const cachedData = getCache(CACHE_KEY_SONGS);
      resolve({ success: true, data: cachedData });
      return;
    }

    // 显示加载状态
    wx.showLoading({ title: '加载中...' });

    request('/songs', {
      method: 'GET'
    })
    .then((response) => {
      wx.hideLoading();
      
      // 处理响应数据
      if (response && Array.isArray(response)) {
        // 缓存数据
        setCache(CACHE_KEY_SONGS, response);
        resolve({ success: true, data: response });
      } else {
        resolve({ success: false, message: '数据格式错误' });
      }
    })
    .catch((error) => {
      wx.hideLoading();
      resolve({ success: false, message: error.message });
    });
  });
}

/**
 * 声乐评估
 * @param {string} referencePath - 参考音频路径
 * @param {string} userAudioPath - 用户音频路径
 * @returns {Promise<Object>} 评估结果
 */
export function evaluateVocal(referencePath, userAudioPath) {
  return new Promise((resolve, reject) => {
    // 显示加载状态
    wx.showLoading({ title: '分析中...' });

    try {
      // 读取音频文件
      const fileSystemManager = wx.getFileSystemManager();
      const referenceFile = fileSystemManager.readFileSync(referencePath);
      const userFile = fileSystemManager.readFileSync(userAudioPath);

      // 构建表单数据
      const formData = {
        reference: referenceFile,
        user: userFile
      };

      request('/evaluate', {
        method: 'POST',
        data: formData
      })
      .then((response) => {
        wx.hideLoading();
        resolve(response);
      })
      .catch((error) => {
        wx.hideLoading();
        reject(error);
      });

    } catch (error) {
      wx.hideLoading();
      reject(new Error('音频文件读取失败'));
    }
  });
}

/**
 * 清除歌曲缓存
 */
export function clearSongsCache() {
  try {
    wx.removeStorageSync(CACHE_KEY_SONGS);
  } catch (error) {
    console.error('缓存清除失败:', error);
  }
}

/**
 * 获取缓存状态
 * @returns {Object} 缓存信息
 */
export function getCacheInfo() {
  try {
    const cache = wx.getStorageSync(CACHE_KEY_SONGS);
    if (!cache) {
      return { hasCache: false };
    }
    
    const now = Date.now();
    const age = now - cache.timestamp;
    const isValid = age < CACHE_DURATION;
    
    return {
      hasCache: true,
      isValid,
      age: Math.floor(age / 1000 / 60), // 分钟
      expiresIn: Math.floor((CACHE_DURATION - age) / 1000 / 60) // 剩余分钟
    };
  } catch (error) {
    return { hasCache: false, error: error.message };
  }
}
