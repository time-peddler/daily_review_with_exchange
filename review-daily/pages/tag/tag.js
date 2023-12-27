Page({

  /**
   * 页面的初始数据
   */
  data: {
    notesCount: wx.getStorageSync('notesCount'),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const allSelected = wx.getStorageSync('allSelected');
    // 获取已有的标签数量数据（tagCounts）并转换为数组
    const tags = wx.getStorageSync('tags');
    this.setData({
      allSelected,
      tags
    });
  },

  onSelectAll: function () {
    const allSelected = !wx.getStorageSync('allSelected');
    wx.setStorageSync('allSelected', allSelected);
    const tags = wx.getStorageSync('tags')
    for (let i = 0; i < tags.length; i++) {
      tags[i].selected = allSelected;
    };
    wx.setStorageSync('tags', tags)
    this.setData({
      allSelected,
      tags
    })
  },

  tagSelected: function (e) {
    const allSelected = false;
    wx.setStorageSync('allSelected', allSelected);
    const index = e.currentTarget.dataset.index;
    const tags = this.data.tags;
    tags[index].selected = !tags[index].selected;

    const selectedTags = tags.filter(tag => tag.selected);
    wx.setStorageSync('tags', tags)
    this.setData({
      allSelected,
      tags,
      selectedTags
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})