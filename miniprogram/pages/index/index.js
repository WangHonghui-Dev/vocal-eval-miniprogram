import { getReferenceSongs } from '../../utils/api';

Page({
  data: {
    songList: [],
    selectedSongId: null,
    isLoading: false,
    isEmpty: false,
    emptyText: '暂无歌曲，请稍后重试',
  },

  onLoad() {
    this.loadSongs();
  },

  async loadSongs() {
    try {
      this.setData({ isLoading: true });
      wx.showLoading({ title: '加载中...', mask: true });

      // 模拟数据，用于演示
      const mockSongs = [
        {
          id: 1,
          name: '小星星',
          artist: '儿歌',
          title: '小星星',
          songName: '小星星',
          singer: '儿歌',
          author: '儿歌',
          value: 1,
          duration: '2:30',
          difficulty: '简单',
        },
        {
          id: 2,
          name: '生日快乐',
          artist: '传统',
          title: '生日快乐',
          songName: '生日快乐',
          singer: '传统',
          author: '传统',
          value: 2,
          duration: '1:45',
          difficulty: '简单',
        },
        {
          id: 3,
          name: '两只老虎',
          artist: '儿歌',
          title: '两只老虎',
          songName: '两只老虎',
          singer: '儿歌',
          author: '儿歌',
          value: 3,
          duration: '2:15',
          difficulty: '简单',
        },
        {
          id: 4,
          name: '茉莉花',
          artist: '民歌',
          title: '茉莉花',
          songName: '茉莉花',
          singer: '民歌',
          author: '民歌',
          value: 4,
          duration: '3:20',
          difficulty: '中等',
        },
        {
          id: 5,
          name: '月亮代表我的心',
          artist: '邓丽君',
          title: '月亮代表我的心',
          songName: '月亮代表我的心',
          singer: '邓丽君',
          author: '邓丽君',
          value: 5,
          duration: '4:15',
          difficulty: '中等',
        },
      ];

      // 尝试从API获取数据，如果失败则使用模拟数据
      try {
        const res = await getReferenceSongs();
        const list = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.songs)
          ? res.songs
          : mockSongs;

        if (!Array.isArray(list) || list.length === 0) {
          this.setData({
            songList: mockSongs,
            selectedSongId: 1,
            isEmpty: false,
          });
          return;
        }

        const firstId =
          list[0]?.id !== undefined
            ? list[0].id
            : list[0]?.songId !== undefined
            ? list[0].songId
            : list[0]?.value !== undefined
            ? list[0].value
            : 1;

        this.setData({
          songList: list,
          selectedSongId: firstId,
          isEmpty: false,
        });
      } catch (apiError) {
        console.log('API调用失败，使用模拟数据:', apiError);
        this.setData({
          songList: mockSongs,
          selectedSongId: 1,
          isEmpty: false,
        });
      }
    } catch (error) {
      console.error('加载歌曲失败:', error);
      wx.showToast({ title: '加载失败，请重试', icon: 'none' });
      this.setData({ songList: [], selectedSongId: null, isEmpty: true });
    } finally {
      this.setData({ isLoading: false });
      wx.hideLoading();
      if (typeof wx.stopPullDownRefresh === 'function')
        wx.stopPullDownRefresh();
    }
  },

  onPullDownRefresh() {
    this.loadSongs();
  },

  // 点击列表行
  handleCellTap(e) {
    const { id } = e.currentTarget.dataset || {};
    if (id === undefined || id === null) return;
    if (id === this.data.selectedSongId) return;
    this.setData({ selectedSongId: id });
  },

  // 单选变化（保持与滑动时的状态一致）
  handleRadioChange(e) {
    const value = e?.detail?.value ?? e?.detail;
    if (value === undefined || value === null) return;
    this.setData({ selectedSongId: value });
  },

  // 底部按钮：开始录音
  startRecord() {
    const { selectedSongId } = this.data;
    if (
      selectedSongId === null ||
      selectedSongId === undefined ||
      selectedSongId === ''
    ) {
      wx.showToast({ title: '请先选择一首歌曲', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `../record/record?songId=${selectedSongId}` });
  },
});
