const app = getApp();
const ews = require('../../utils/ews')


Page({
  data: {
    theme: app.globalData.theme,
    screenHeight: app.globalData.screenHeight,
    screenWidth: app.globalData.screenWidth,
    statusBarHeight: app.globalData.statusBarHeight,
    capsuleBarHeight: app.globalData.capsuleBarHeight,
    isFullScreen: app.globalData.isFullScreen,
  },

  onShow(options) {
    const cards = wx.getStorageSync('cards')
    this.setData({
      cards: cards || app.globalData.cards
    })
  },

  onLoad(options) {
    // 加载页面时获取数据
    // const cachedUsername = wx.getStorageSync('cached_username');
    // const cachedPassword = wx.getStorageSync('cached_password');
    // if (cachedUsername && cachedPassword) {
    //   ews.fetchData();
    // }
  },

  // 监听下拉刷新事件
  onPullDownRefresh: function () {
    let that = this
    // 下拉刷新时重新获取数据
    ews.fetchData().then(() => {
      that.setData({
        cards: wx.getStorageSync('cards')
      });
      wx.stopPullDownRefresh();
    });
  },

  showImagePreview: function (event) {
    const images = event.currentTarget.dataset.images.map(img => wx.env.USER_DATA_PATH + '/' + img.fileName);
    // console.log('images:', images)
    wx.previewImage({
      urls: images
    });
  }

});