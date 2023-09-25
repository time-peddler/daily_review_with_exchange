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
    cards: [{
        id: '0001',
        body: '#knowledge 封狼居胥，指西汉大将霍去病登狼居胥山筑坛祭天以告成功之事，出自于《汉书·霍去病传》，后来封狼居胥成为中华民族武将的最高荣誉之一。封狼居胥的主人公为霍去病，而非卫青。',
        dateTime: '1949年10月01日 15:00'
      },
      {
        id: '0002',
        body: '#history 周亚夫平定七国叛乱，文景之治—>文帝安抚吴王刘濞，景帝听从晁错“削藩策”，引起吴王联合齐国叛乱，景帝腰斩晁错拟平息叛乱—>苏轼的《晁错论》，最终由周亚夫平定。',
        dateTime: '1037年1月8日 12:55'
      },
      {
        id: '0003',
        body: '#vocabulary Hong Kong’s local currency is pegged to the U.S. dollar. 港币与美元挂钩',
        dateTime: '2038年01月01日 00:00'
      }
    ],
  },

  onLoad(options) {
    const cachedUsername = wx.getStorageSync('cached_username');
    const cachedPassword = wx.getStorageSync('cached_password');
    if (cachedUsername && cachedPassword) {
      this.fetchData();
    }
  },

  // 监听下拉刷新事件
  onPullDownRefresh: function () {
    // 下拉刷新时重新获取数据
    this.fetchData(() => {
      // 停止下拉刷新动画
      wx.stopPullDownRefresh();
    });
  },

  fetchData(callback) {
    ews.fetchData()
      .then((itemContents) => {
        console.log('itemContents:', itemContents);
        // 更新页面的 cards 数据
        this.setData({
          cards: itemContents,
        });
        if (typeof callback === 'function') {
          callback(); // 调用回调函数
        }
      })
      .catch((error) => {
        console.error('Fetching data failed:', error);
        if (typeof callback === 'function') {
          callback(); // 调用回调函数
        }
      });
  },

});