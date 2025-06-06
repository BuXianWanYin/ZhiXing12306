// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 获取星期几的中文表示
function getWeekStr(date) {
  const weekArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekArr[date.getDay()];
}

Page({
  data: {
    departureStation: '', // 出发站
    arrivalStation: '', // 到达站
    travelDate: '', // 出行日期
    trainList: [], // 车次列表
    dateTabs: [], // 日期选项卡
    currentDateIndex: 0, // 当前选中的日期索引
    scrollIntoView: '', // 滚动到视图的日期ID
    isHighSpeedTrain: false, // 是否只显示高铁动车
    isStudentTicket: false // 是否为学生票
  },

  onLoad: function (options) {
    const fromStation = options.departureStation;
    const toStation = options.arrivalStation;
    const date = options.travelDate;
    const isHighSpeedTrain = options.isHighSpeedTrain === 'true';
    const isStudentTicket = options.isStudentTicket === 'true';
    const today = formatDate(new Date());

    let dateTabs = [];
    let currentDateIndex = 0;

    const DAYS = 14; // 显示14天的日期选项

    if (date === today) {
      // 如果选择的是今天，则从今天开始往后推14天
      for (let i = 0; i < DAYS; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        let weekStr = getWeekStr(d);
        if (i === 0) weekStr = '今天';
        else if (i === 1) weekStr = '明天';
        else if (i === 2) weekStr = '后天';
        dateTabs.push({
          dateStr,
          weekStr,
          id: 'date-' + i,
          dateShort: dateStr.slice(5)
        });
      }
      currentDateIndex = 0;
    } else {
      // 如果选择的是其他日期，则以该日期为中心，前后各显示几天
      const center = Math.floor(DAYS / 2);
      let baseDate = new Date(date);
      for (let i = -center; i <= DAYS - center - 1; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);
        let weekStr = getWeekStr(d);
        const todayObj = new Date(today);
        const diff = (d - todayObj) / (1000 * 60 * 60 * 24);
        if (diff === 0) weekStr = '今天';
        else if (diff === 1) weekStr = '明天';
        else if (diff === 2) weekStr = '后天';
        dateTabs.push({
          dateStr,
          weekStr,
          id: 'date-' + (i + center),
          dateShort: dateStr.slice(5)
        });
        if (dateStr === date) currentDateIndex = i + center;
      }
      // 移除历史日期
      while (dateTabs.length > 0 && dateTabs[0].dateStr < today) {
        dateTabs.shift();
        currentDateIndex--;
      }
    }

    this.setData({
      departureStation: fromStation,
      arrivalStation: toStation,
      travelDate: date,
      dateTabs,
      currentDateIndex,
      scrollIntoView: dateTabs[currentDateIndex]?.id || '',
      isHighSpeedTrain,
      isStudentTicket
    });

    this.fetchTrainList(fromStation, toStation, date);
  },

  // 日期选项卡点击事件
  onDateTabTap(e) {
    const index = e.currentTarget.dataset.index;
    const dateTabs = this.data.dateTabs;
    const newDate = dateTabs[index].dateStr;
    this.setData({
      currentDateIndex: index,
      travelDate: newDate,
      scrollIntoView: dateTabs[index].id
    });
    this.fetchTrainList(this.data.departureStation, this.data.arrivalStation, newDate);
  },

  // 获取车次列表
  fetchTrainList(fromStation, toStation, date) {
    const payload = {
      searchDataType: 1,
      searchType: 0,
      searchTrainConditions: [
        {
          departStation: fromStation,
          arriveStation: toStation,
          departDate: date
        }
      ]
    };
    wx.request({
      url: 'https://m.suanya.com/restapi/soa2/22867/json/getTrainStationInfoListV1',
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: payload,
      success: (res) => {
        let trainList = (res.data.trainStationInfoList || []).map(item => {
          // 根据车次号判断是否为高铁动车
          const trainNumber = item.trainNo || '';
          const isHighSpeed = /^[GDC]/.test(trainNumber);
          
          let displaySeats = []; // 显示的座位信息
          let displayPrice = '--'; // 显示的价格

          const seats = item.seats || [];

          if (isHighSpeed) {
            // 处理高铁动车的座位信息
            const highSpeedSeatNames = ['二等座', '一等座', '商务座', '特等座', '无座', '动卧'];
            highSpeedSeatNames.forEach(typeName => {
                const foundSeat = seats.find(s => s.seatName === typeName);
                if(foundSeat) {
                     const isAvailable = (foundSeat.ticketLeftDesc === '有票' || foundSeat.ticketLeftDesc?.includes('张'));
                     const countDisplay = (typeName === '无座' && (foundSeat.ticketLeftDesc === '' || foundSeat.ticketLeftDesc === '--' || foundSeat.ticketLeftDesc === '无票')) ? '无票' : (foundSeat.ticketLeftDesc || '--');
                     displaySeats.push({
                         name: typeName,
                         count: countDisplay,
                         available: isAvailable || foundSeat.ticketLeftDesc === '候补'
                     });
                     // 设置显示价格，优先显示二等座价格
                     if(typeName === '二等座' && foundSeat.price) displayPrice = foundSeat.price;
                     else if(typeName === '一等座' && displayPrice === '--' && foundSeat.price) displayPrice = foundSeat.price;
                     else if(('商务座' === typeName || '特等座' === typeName) && displayPrice === '--' && foundSeat.price) displayPrice = foundSeat.price;
                }
            });
          } else {
            // 处理普通列车的座位信息
            const regularSeatNames = ['硬卧', '软卧', '硬座', '动卧', '无座']; 
             regularSeatNames.forEach(typeName => {
                const foundSeat = seats.find(s => s.seatName === typeName);
                if(foundSeat) {
                     const isAvailable = (foundSeat.ticketLeftDesc === '有票' || foundSeat.ticketLeftDesc?.includes('张'));
                     const countDisplay = (typeName === '无座' && (foundSeat.ticketLeftDesc === '' || foundSeat.ticketLeftDesc === '--' || foundSeat.ticketLeftDesc === '无票')) ? '无票' : (foundSeat.ticketLeftDesc || '--');
                     displaySeats.push({
                         name: typeName,
                         count: countDisplay,
                         available: isAvailable || foundSeat.ticketLeftDesc === '候补'
                     });
                     // 设置显示价格，优先显示硬卧价格
                     if(typeName === '硬卧' && foundSeat.price) displayPrice = foundSeat.price;
                     else if(typeName === '软卧' && displayPrice === '--' && foundSeat.price) displayPrice = foundSeat.price;
                     else if(typeName === '硬座' && displayPrice === '--' && foundSeat.price) displayPrice = foundSeat.price;
                     else if(typeName === '动卧' && displayPrice === '--' && foundSeat.price) displayPrice = foundSeat.price;
                }
            });
          }

          // 处理无座信息
          const noSeatCheck = seats.find(s => s.seatName === '无座');
          const isNoSeatAlreadyAdded = displaySeats.some(seat => seat.name === '无座');
          if(noSeatCheck && !isNoSeatAlreadyAdded) {
                 const countDisplay = (noSeatCheck.ticketLeftDesc === '' || noSeatCheck.ticketLeftDesc === '--' || noSeatCheck.ticketLeftDesc === '无票') ? '无票' : (noSeatCheck.ticketLeftDesc || '--');
                 displaySeats.push({
                     name: '无座',
                     count: countDisplay,
                     available: (noSeatCheck.ticketLeftDesc === '有票' || noSeatCheck.ticketLeftDesc?.includes('张') || noSeatCheck.ticketLeftDesc === '候补')
                 });
          }

          // 对座位类型进行排序
          displaySeats.sort((a, b) => {
               const orderHighSpeed = ['二等座', '一等座', '商务座', '特等座', '无座', '动卧'];
               const orderRegular = ['硬卧', '软卧', '硬座', '动卧', '无座'];
               const order = isHighSpeed ? orderHighSpeed : orderRegular;
               return order.indexOf(a.name) - order.indexOf(b.name);
           });

          // 生成座位映射
          let seatMap = {};
          displaySeats.forEach(seat => {
            seatMap[seat.name] = seat.count;
          });

          return {
            departureTime: item.startTime,
            arrivalTime: item.arriveTime,
            trainNumber: item.trainNo,
            duration: item.durationDesc,
            price: displayPrice === '--' ? '--' : parseFloat(displayPrice).toFixed(1),
            displaySeats: displaySeats,
            seatMap: seatMap,
            isHighSpeed: isHighSpeed
          };
        });

        // 如果选择了只显示高铁动车，则过滤掉普通列车
        if (this.data.isHighSpeedTrain) {
          trainList = trainList.filter(train => train.isHighSpeed);
        }

        this.setData({ trainList });
      },
      fail: (err) => {
        wx.showToast({ title: '查询失败', icon: 'none' });
      }
    });
  },

  // 返回首页
  onBack() {
    wx.reLaunch({
      url: '/pages/index/index',
      success: () => {
        console.log('返回首页成功');
      },
      fail: (err) => {
        console.error('返回首页失败:', err);
        wx.showToast({
          title: '返回失败',
          icon: 'none'
        });
      }
    });
  },

  // 交换始发站和终点站
  onToggleStation() {
    const { departureStation, arrivalStation, travelDate } = this.data;
    this.setData({
      departureStation: arrivalStation,
      arrivalStation: departureStation
    });
    this.fetchTrainList(arrivalStation, departureStation, travelDate);
  }
})