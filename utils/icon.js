
function fetchIcons() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'http://localhost:3000/api/icons',
        success: res => resolve(res.data),
        fail: reject
      });
    });
  }
  module.exports = { fetchIcons };