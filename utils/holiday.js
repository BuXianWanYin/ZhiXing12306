const APP_ID = 'rxoejspbrlnlsum8';
const APP_SECRET = 'IkWHtrE1AKIYuNxNLTMeQk6GvhARCjoL';

// 获取某月所有天的节假日和农历信息
function getMonthHolidayAndLunar(year, month) {
  return new Promise((resolve, reject) => {
    const monthStr = `${year}${month.toString().padStart(2, '0')}`;
    const cacheKey = 'holiday_month_' + monthStr;
    const cache = wx.getStorageSync(cacheKey);
    if (cache) {
      resolve(cache);
      return;
    }
    wx.request({
      url: `https://www.mxnzp.com/api/holiday/list/month/${monthStr}`,
      data: {
        app_id: APP_ID,
        app_secret: APP_SECRET,
        ignoreHoliday: false
      },
      success(res) {
        if (res.data && res.data.code === 1 && res.data.data) {
          wx.setStorageSync(cacheKey, res.data.data);
          resolve(res.data.data);
        } else {
          resolve([]);
        }
      },
      fail() {
        resolve([]);
      }
    });
  });
}

module.exports = {
  getMonthHolidayAndLunar
};