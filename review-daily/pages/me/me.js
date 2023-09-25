const app = getApp()
const ews = require('../../utils/ews')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoginBox: false, // 控制显示登录框或登录成功界面
    username: app.globalData.username,
    password: app.globalData.password
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
    let that = this;

    // 在页面加载时，将 app.globalData.notesCount 的值赋值给 data 中的 notesCount
    that.setData({
      notesCount: app.globalData.notesCount,
    });
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

    // 将数据同步到 storages 中
    wx.setStorageSync('cached_username', inputUsername);
    wx.setStorageSync('cached_password', inputPassword);
    ews.login(inputUsername).then((status) => {
      if (status == "NoError") {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000, // 显示时间 2 秒
        });
      } else {
        // 登录失败
        wx.showToast({
          title: '登录失败',
          icon: 'none', // 显示无图标
          duration: 2000,
        });
      }
    })
    
    // 关闭登录框
    this.setData({
      showLoginBox: false,
    });
  },
})