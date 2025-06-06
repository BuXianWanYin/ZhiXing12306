Page({
    data: {
      tickets: [
        {
          id: 1,
          from: '哈尔滨',
          to: '北京',
          date: '02月03日',
          statusText: '查看',
          statusClass: 'status-success',
          subtitle: '已取消'
        },
        {
          id: 2,
          from: '北京',
          to: '佳木斯',
          date: '02月07日',
          statusText: '查看',
          statusClass: 'status-success',
          subtitle: '已取消'
        },
        {
          id: 3,
          from: '北京',
          to: '南京',
          date: '02月06日',
          statusText: '开始',
          statusClass: 'status-wait',
          subtitle: '已取消'
        },
        {
          id: 4,
          from: '合肥',
          to: '北京',
          date: '02月07日',
          statusText: '开始',
          statusClass: 'status-wait',
          subtitle: '抢票终止'
        }
      ]
    },
    onBack() {
      wx.reLaunch({
        url: '/pages/user/index',
        success: () => {
        },
        fail: (err) => {
          wx.showToast({
            title: '返回失败',
            icon: 'none'
          });
        }
      });
    }
  })