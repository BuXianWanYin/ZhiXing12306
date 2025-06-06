import { getMonthHolidayAndLunar } from '../../utils/holiday.js';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

Component({
  properties: {
    // 控制组件显示/隐藏
    show: {
      type: Boolean,
      value: false,
      observer: function(newVal, oldVal) {
        // 当组件从隐藏变为显示时
        if (newVal === true && oldVal === false) {
          const selectedDate = this.data.selectedDate;
          // 如果有有效的选中日期
          if (selectedDate && typeof selectedDate === 'string' && selectedDate.split('-').length === 3) {
            const [year, month] = selectedDate.split('-');
            const numYear = Number(year);
            const numMonth = Number(month);
            // 如果当前显示的月份和选中的月份不同，则重新初始化日历到选中月份
            if (this.data.year !== numYear || this.data.month !== numMonth) {
              this.setData({
                year: numYear,
                month: numMonth
              });
              this.initCalendar(numYear, numMonth);
            } else {
              // 如果月份相同，确保选中日期被高亮
              this.initCalendar(this.data.year, this.data.month);
            }
          } else {
            // 如果没有有效的选中日期，初始化显示当前月份
            const today = new Date();
            this.setData({
               year: today.getFullYear(),
               month: today.getMonth() + 1,
               selectedDate: this.formatDate(today) // 确保有默认选中日期
            });
            this.initCalendar(this.data.year, this.data.month);
          }
        }
      }
    },
    // 外部传入的选中日期 (格式: yyyy-mm-dd)
    dateText: {
      type: String,
      value: '',
      observer: function(newVal) {
        // 当外部传入的选中日期变化时
        if (newVal && typeof newVal === 'string' && newVal.split('-').length === 3) {
          const [year, month] = newVal.split('-');
          const numYear = Number(year);
          const numMonth = Number(month);
          this.setData({
            selectedDate: newVal,
            // 注意：这里不改变显示的年/月，只更新 selectedDate
          });
          // 重新初始化日历，确保高亮正确 (即使月份没变，数据可能需要刷新)
          // initCalendar 会使用最新的 this.data.selectedDate 来判断高亮
          this.initCalendar(numYear, numMonth);
        } else if (newVal === '') {
            // 处理外部清空日期的情况，可能需要清除选中状态并重置到当前月份
             const today = new Date();
             this.setData({
                selectedDate: this.formatDate(today), // 默认选中今天
                year: today.getFullYear(),
                month: today.getMonth() + 1,
             });
             this.initCalendar(this.data.year, this.data.month);
        }
      }
    }
  },
  data: {
    year: 2025, // 当前显示的年份
    month: 6, // 当前显示的月份
    days: [], // 日历数据数组
    weekDays, // 星期数组
    selectedDate: '' // 当前选中的日期 (格式: yyyy-mm-dd)
  },
  lifetimes: {
    attached() {
      // 组件生命周期回调 - 在组件实例进入页面节点树时执行
      const today = new Date();
      let selectedDate = this.properties.dateText; // 尝试使用外部传入的日期初始化
      let year, month;

      // 如果外部传入了有效的日期
      if (selectedDate && typeof selectedDate === 'string' && selectedDate.split('-').length === 3) {
        [year, month] = selectedDate.split('-');
        year = Number(year);
        month = Number(month);
      } else {
        // 如果没有有效外部日期，默认选中并显示今天
        year = today.getFullYear();
        month = today.getMonth() + 1;
        selectedDate = this.formatDate(today);
      }

      this.setData({
        year,
        month,
        selectedDate
      });

      // 初始化显示当前月份的日历
      this.initCalendar(year, month);
    }
  },
  methods: {
    // 阻止事件穿透
    stop() {},
    // 关闭日期选择器弹窗
    onClose() {
      this.triggerEvent('close');
      this.setData({ show: false });
    },
    // 选择日期
    onSelectDay(e) {
      const date = e.currentTarget.dataset.date;
      if (!date) return;

      const oldSelectedDate = this.data.selectedDate;
      const newSelectedDate = date;

      // 如果选择了同一个日期，则只关闭弹窗
      if (oldSelectedDate === newSelectedDate) {
        this.triggerEvent('select', { date: newSelectedDate }); // 即使选同一个日期也触发select事件
        this.setData({ show: false });
        return;
      }

      // 更新选中日期
      this.setData({
        selectedDate: newSelectedDate,
      });

      // 触发选择事件，将新日期传递出去
      this.triggerEvent('select', { date: newSelectedDate });

      // 关闭弹窗
      this.setData({ show: false });
    },
    // 切换到上一个月
    prevMonth() {
      let { year, month } = this.data;
      month--;
      if (month < 1) {
        month = 12;
        year--;
      }
      this.setData({ year, month });
      // 初始化显示上一个月的日历
      this.initCalendar(year, month);
    },
    // 切换到下一个月
    nextMonth() {
      let { year, month } = this.data;
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
      this.setData({ year, month });
      // 初始化显示下一个月的日历
      this.initCalendar(year, month);
    },
    // 生成日历数据
    initCalendar(year, month) {
      // 异步获取整月农历和节假日数据
      getMonthHolidayAndLunar(year, month).then(monthData => {
        const days = [];
        const firstDay = new Date(year, month - 1, 1);
        const startWeek = firstDay.getDay();
        const daysCount = new Date(year, month, 0).getDate();
        const selectedDate = this.data.selectedDate; // 获取当前选中的日期用于判断高亮
        const today = new Date(); // 用于判断是否是今天
        today.setHours(0,0,0,0); // 清零时分秒，精确比较日期

        // 补齐上月空白日期
        for (let i = 0; i < startWeek; i++) { // 只补startWeek个空白，周日不补空
          days.push({ day: '', isCurrentMonth: false, key: `empty-${year}-${month}-${i}` });
        }

        // 生成当前月份的日期数据
        for (let d = 1; d <= daysCount; d++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
          const dayInfo = monthData.find(item => item.date === dateStr) || {};

          // 判断是否是今天
          const isToday = new Date(dateStr).getTime() === today.getTime();

          // 获取农历、节假日信息
          let festival = '';
          if (dayInfo.solarTerms && !/后$/.test(dayInfo.solarTerms)) {
            festival = dayInfo.solarTerms;
          }
          let holiday = dayInfo.holiday || '';
          let lunar = '';
          if (dayInfo.lunarCalendar) {
            const match = dayInfo.lunarCalendar.match(/(初|十|廿|三十)[一二三四五六七八九十]/);
            lunar = match ? match[0] : dayInfo.lunarCalendar.slice(-2);
          }
          let isReserve = false;
          if (dayInfo.typeDes && dayInfo.typeDes.indexOf('预约') !== -1) {
            isReserve = true;
          }

          days.push({
            day: d,
            date: dateStr,
            isCurrentMonth: true,
            isToday: isToday,
            isSelected: selectedDate === dateStr, // 根据 selectedDate 判断是否选中高亮
            lunar,
            festival,
            holiday,
            weekDay: dayInfo.weekDay || '',
            suit: dayInfo.suit || '',
            avoid: dayInfo.avoid || '',
            isReserve
          });
        }

        // 更新组件数据，渲染日历
        this.setData({
          year,
          month,
          days
        });
      }).catch(err => {
          // 即使获取数据失败，也要渲染基础日历
           const days = [];
           const firstDay = new Date(year, month - 1, 1);
           const startWeek = firstDay.getDay();
           const daysCount = new Date(year, month, 0).getDate();
           const selectedDate = this.data.selectedDate;
           const today = new Date();
           today.setHours(0,0,0,0);

           for (let i = 0; i < startWeek; i++) {
             days.push({ day: '', isCurrentMonth: false, key: `empty-${year}-${month}-${i}` });
           }
           for (let d = 1; d <= daysCount; d++) {
              const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
               const isToday = new Date(dateStr).getTime() === today.getTime();
              days.push({
                 day: d,
                 date: dateStr,
                 isCurrentMonth: true,
                 isToday: isToday,
                 isSelected: selectedDate === dateStr,
                 lunar: '', festival: '', holiday: '', weekDay: '', suit: '', avoid: '', isReserve: false
              });
           }
           this.setData({
             year,
             month,
             days
           });
      });
    },
    // 格式化日期为 'M月d日'
    formatDate(date) {
      if (typeof date === 'string') { // 如果已经是字符串，尝试解析
         const parts = date.split('-');
         if (parts.length === 3) {
            return `${parseInt(parts[1])}月${parseInt(parts[2])}日`;
         }
         return date; // 否则返回原字符串
      }
       // 如果是 Date 对象
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
});