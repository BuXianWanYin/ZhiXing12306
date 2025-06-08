Page({
  data: {
    userInfo: {
      avatar: '/images/avatar-default.svg',
      nickname: '未登录',
      desc: '点击登录账号',
      uid: ''
    },
    listItems: [
      {
        icon: '/images/user/caifu.png',
        text: '我的财富',
        extra: '0个加速币'
      },
      {
        icon: '/images/user/chuxing.png',
        text: '出行服务',
        extra: '正晚点/时刻表',
        extraType: 'link'
      },
      {
        icon: '/images/user/yaoqing.png',
        text: '邀请好友',
        extra: '一起来抢票',
        extraType: 'link',
        url: '/pages/rob-ticket/index'
      },
      {
        icon: '/images/user/xiaoxi.png',
        text: '消息中心',
        extra: '在线服务',
        extraType: 'link'
      },
      {
        icon: '/images/user/yijian.png',
        text: '产品意见'
      },
      {
        icon: '/images/user/gengduo.png',
        text: '更多'
      }
    ]
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    console.log('onLoad: 从本地缓存获取 userInfo:', userInfo);
    if (userInfo) {
      this.setData({ userInfo });
      console.log('onLoad: setData 后 userInfo:', this.data.userInfo);
    }
  },
  onLogin() {
    console.log('onLogin: 点击登录');
    if (this.data.userInfo.nickname !== '未登录') {
      console.log('onLogin: 已登录，直接返回');
      return;
    }
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        console.log('onLogin: getUserProfile 成功', res.userInfo);
        wx.login({
          success: (loginRes) => {
            console.log('onLogin: wx.login 成功', loginRes.code);
            wx.request({
              url: 'http://localhost:3000/api/user/login',
              method: 'POST',
              data: {
                code: loginRes.code,
                avatar: res.userInfo.avatarUrl,
                nickname: res.userInfo.nickName
              },
              success: (resp) => {
                console.log('onLogin: 后端返回', resp.data);
                if (resp.data && resp.data.success) {
                  const userInfo = {
                    avatar: resp.data.avatar,
                    nickname: resp.data.nickname,
                    desc: '微信用户',
                    uid: resp.data.openid
                  };
                  this.setData({ userInfo });
                  wx.setStorageSync('userInfo', userInfo);
                  wx.showToast({ title: '登录成功', icon: 'success' });
                  console.log('onLogin: 登录成功，userInfo:', userInfo);
                  console.log('登录后端返回的头像路径:', resp.data.avatar);
                } else {
                  wx.showToast({ title: '登录失败', icon: 'none' });
                  console.log('onLogin: 登录失败', resp.data);
                }
              }
            });
          }
        });
      }
    });
  },

  // 更换头像
  onChangeAvatar() {
    const { uid } = this.data.userInfo;
    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        wx.uploadFile({
          url: 'http://localhost:3000/api/user/uploadAvatar',
          filePath: tempFilePath,
          name: 'avatar',
          formData: { uid },
          success: (uploadRes) => {
            console.log('uploadRes.data:', uploadRes.data);
            const data = JSON.parse(uploadRes.data);
            console.log('后端返回的头像路径:', data.avatarUrl);
            if (data.success) {
              this.setData({
                'userInfo.avatar': data.avatarUrl + '?t=' + Date.now()
              });
              console.log('onChangeAvatar: 头像已更新', this.data.userInfo.avatar);
              wx.setStorageSync('userInfo', this.data.userInfo);
              wx.showToast({ title: '头像已更新', icon: 'success' });
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' });
            }
          }
        });
      }
    });
  },

  // 修改昵称
  onChangeNickname(e) {
    const newNickname = e.detail.value;
    const { uid } = this.data.userInfo;
    if (!uid) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.request({
      url: 'http://localhost:3000/api/user/updateNickname',
      method: 'POST',
      data: { uid, nickname: newNickname },
      success: (res) => {
        if (res.data && res.data.success) {
          this.setData({
            'userInfo.nickname': newNickname
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({ title: '昵称已更新', icon: 'success' });
        } else {
          wx.showToast({ title: '修改失败', icon: 'none' });
        }
      }
    });
  },

  onActionTap(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  onListItemTap(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    }
  }
}); 