Page({
  data: {
    userInfo: null,
    isLogin: false
  },

  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        isLogin: true
      });
    }
  },

  onShow() {
    // 设置当前页面的 tabBar 索引
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        activeTabIndex: 3  // 个人中心是第四个 tab
      });
    }
  },

  // 登录
  onLogin() {
    if (!this.data.isLogin) {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const userInfo = res.userInfo;
          this.setData({
            userInfo,
            isLogin: true
          });
          wx.setStorageSync('userInfo', userInfo);
        },
        fail: (err) => {
          console.error('登录失败:', err);
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      });
    }
  }
}) 