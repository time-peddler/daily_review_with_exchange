// app.js
App({
  data() {
    return {
      backgroundHeight: '',
      statusBarHeight: ''
    }
  },
  onShow: function () {
    let that = this;
    // 获取用户手机信息
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res)
        var screenHeight = res.screenHeight,
          screenWidth = res.screenWidth,
          statusBarHeight = res.statusBarHeight;
        that.globalData.isFullScreen = parseInt(screenWidth / screenHeight * 100) < parseInt(9 / 17 * 100),
          that.globalData.systemInfo = res.model,
          that.globalData.isBiggerScreen = screenHeight > 667,
          that.globalData.statusBarHeight = statusBarHeight,
          that.globalData.capsuleBarHeight = 44,
          that.globalData.screenHeight = screenHeight,
          that.globalData.screenWidth = screenWidth;
      }
    });
    // 版本更新
    const updateManager = wx.getUpdateManager();
    // 强制更新
    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      // console.log(res.hasUpdate)
      if (!res.hasUpdate) {
        console.log("-----无更新---");
      }
    });
    // 更新完成
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: "更新提示",
        content: "新版本已经准备好，是否重启应用？",
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    // 更新失败
    updateManager.onUpdateFailed(function () {
      // 新的版本下载失败
      wx.showToast({
        title: "更新失败",
        icon: "none",
        duration: 2000
      });
    });
    // 版本更新部分结束------
  },
  // 如果找不到页面就跳转到首页
  onPageNotFound(res) {
    wx.switchTab({
      url: "pages/index"
    });
  },
  /**
   * 获取tabBar页面路径列表
   */
  getTabBarLinks() {
    return tabBarLinks;
  },

  /**
   * 跳转到指定页面
   * 支持tabBar页面
   */
  navigationTo(url) {
    if (!url || url.length == 0) {
      return false;
    }
    let tabBarLinks = this.getTabBarLinks();
    // tabBar页面
    if (tabBarLinks.indexOf(url) > -1) {
      wx.switchTab({
        url: "/" + url
      });
    } else {
      // 普通页面
      wx.navigateTo({
        url: "/" + url
      });
    }
  },
  globalData: {
    theme: wx.getStorageSync("theme") || "LIGHT",
    isBiggerScreen: !1,
    isFullScreen: !1,
    userInfo: null,
    code: null,
    systemInfo: null,
    statusBarHeight: '',
    capsuleBarHeight: '',
    notesCount: 0,
    ewsUrl: 'https://outlook.office365.com/EWS/Exchange.asmx',
    username: wx.getStorageSync('cached_username'),
    password: wx.getStorageSync('cached_password')
  },
});