const app = getApp()
const ews = require('../../utils/ews')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginBox: false, // 控制显示登录框或登录成功界面
    notesCount: 0,
    lastTapTime: 0,
    delay: 300 // 设置延迟时间
  },

  onShow(options) {
    const tags = wx.getStorageSync('tags');
    this.setData({
      username: app.globalData.username,
      notesCount: wx.getStorageSync('notesCount'),
      scales: wx.getStorageSync('scales'),
      tagsCount: Object.keys(tags).length
    })
  },

  onHideAreaTap: function () {
    // 判断是否显示登录框，如果显示则隐藏
    if (this.data.showLoginBox) {
      this.setData({
        showLoginBox: false,
      });
    }
  },

  // 输入用户名的事件处理函数
  inputUsernameHandler: function (e) {
    app.globalData.username = e.detail.value
  },

  // 输入密码的事件处理函数
  inputPasswordHandler: function (e) {
    app.globalData.password = e.detail.value
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  onLogin(options) {
    this.setData({
      showLoginBox: true
    })
  },

  // 点击登录按钮时触发
  login: function () {

    const {
      inputUsername,
      inputPassword
    } = this.data;
    wx.setStorageSync('allSelected', true);
    ews.login(inputUsername, inputPassword).then((status) => {
      if (status == "NoError") {
        // 将数据同步到 storages 中
        wx.setStorageSync('cached_username', inputUsername);
        wx.setStorageSync('cached_password', inputPassword);
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000, // 显示时间 2 秒
        });
        // 登录成功后获取数据
        ews.fetchData().then(() => {
          // 关闭登录框 并重新刷新该页面数据
          this.setData({
            showLoginBox: false,
            username: wx.getStorageSync('cached_username'),
            notesCount: wx.getStorageSync('notesCount'),
            tagsCount: wx.getStorageSync('tags').length
          });
        });
      } else {
        // 登录失败
        wx.showToast({
          title: '登录失败',
          icon: 'none', // 显示无图标
          duration: 2000,
        });
      }
    });
  },


  onTag: function (e) {
    if (!this.data.username) {
      wx.showToast({
        title: '未登录',
        icon: 'none',
        duration: 2000
      });
    } else {
      let currentTime = e.timeStamp;
      let lastTime = this.data.lastTapTime;
      if (currentTime - lastTime < this.data.delay) {
        wx.navigateTo({
          url: '/pages/tag/tag'
        });
      } else {
        this.setData({
          lastTapTime: currentTime // 单击事件，更新上次点击时间
        });
      }
    }
  },

  onMore: function () {
    this.showNumberPicker();
  },

  showNumberPicker: function () {
    let that = this;
    wx.showActionSheet({
      alertText: "每次需要回顾的数量",
      itemList: ['15', '20', '25', '30', '35', '40'],
      success: function (res) {
        if (!res.cancel) {
          const scales = parseInt(res.tapIndex) * 5 + 15; // 计算出选择的数字
          // console.log("选择的数字为: " + selectedNumber);
          wx.setStorageSync('scales', scales)
          that.setData({
            scales
          })
        }
      }
    });
  },

  onNoteTap: function (e) {
    let currentTime = e.timeStamp;
    let lastTime = this.data.lastTapTime;
    if (currentTime - lastTime < this.data.delay) {
      ews.fetchData()
    } else {
      this.setData({
        lastTapTime: currentTime // 单击事件，更新上次点击时间
      });
    }
  },

})