import { getReferenceSongs } from '../../utils/api'

Page({
  data: {
    songList: [],
    selectedSongId: null,
    isLoading: false,
    isEmpty: false,
    emptyText: '暂无歌曲，请稍后重试',
  },

  onLoad() {
    this.loadSongs()
  },

  async loadSongs() {
    try {
      this.setData({ isLoading: true })
      wx.showLoading({ title: '加载中...', mask: true })

      const res = await getReferenceSongs()
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.songs)
        ? res.songs
        : []

      if (!Array.isArray(list) || list.length === 0) {
        this.setData({ songList: [], selectedSongId: null, isEmpty: true })
        return
      }

      const firstId =
        list[0]?.id !== undefined
          ? list[0].id
          : list[0]?.songId !== undefined
          ? list[0].songId
          : list[0]?.value !== undefined
          ? list[0].value
          : null

      this.setData({ songList: list, selectedSongId: firstId, isEmpty: false })
    } catch (error) {
      wx.showToast({ title: '加载失败，请重试', icon: 'none' })
      this.setData({ songList: [], selectedSongId: null, isEmpty: true })
    } finally {
      this.setData({ isLoading: false })
      wx.hideLoading()
      if (typeof wx.stopPullDownRefresh === 'function') wx.stopPullDownRefresh()
    }
  },

  onPullDownRefresh() {
    this.loadSongs()
  },

  // 点击列表行
  handleCellTap(e) {
    const { id } = e.currentTarget.dataset || {}
    if (id === undefined || id === null) return
    if (id === this.data.selectedSongId) return
    this.setData({ selectedSongId: id })
  },

  // 单选变化（保持与滑动时的状态一致）
  handleRadioChange(e) {
    const value = e?.detail?.value ?? e?.detail
    if (value === undefined || value === null) return
    this.setData({ selectedSongId: value })
  },

  // 底部按钮：开始录音
  startRecord() {
    const { selectedSongId } = this.data
    if (selectedSongId === null || selectedSongId === undefined || selectedSongId === '') {
      wx.showToast({ title: '请先选择一首歌曲', icon: 'none' })
      return
    }
    wx.navigateTo({ url: `../record/record?songId=${selectedSongId}` })
  },
})


