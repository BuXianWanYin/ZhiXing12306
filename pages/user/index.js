Page({
  data: {
    userInfo: null,
    isLogin: false,
    tabIndex:3
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

  onLoad() {
    console.log('本页tabIndex:', this.data.tabIndex);
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