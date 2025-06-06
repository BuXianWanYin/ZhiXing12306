const { stationGroupedData } = require('../../utils/station_data');

Component({
  options: {
    styleIsolation: 'shared'
  },
  properties: {
    show: { type: Boolean, value: false },
    title: { type: String, value: '选择站点' }
  },
  data: {
    stationData: {}, // 站点数据
    letterList: [], // 字母列表
    searchKeyword: '', // 搜索关键词
    searchResults: [], // 搜索结果
    groupedStations: {}, // 按字母分组的站点
    currentLetter: 'A', // 当前显示的字母
    pageSize: 20, // 每页显示的站点数量
    currentPage: 1, // 当前页码
    scrollViewTarget: '', // 滚动目标id
    activeLetterIndex: 'A', // 当前高亮的字母索引
    letterIndexPositions: [], // 侧边字母索引项的位置
    sequentialLoadingIndex: 0, // 顺序加载的索引
    isSequentialLoading: false, // 顺序加载状态
    sequentialLoadingTimer: null, // 顺序加载的计时器
    placeholderText: '请输入城市或站点'
  },
  lifetimes: {
    attached() {
      // 初始化字母列表和站点数据
      const letters = Object.keys(stationGroupedData).sort();
      this.setData({
        letterList: letters,
        stationData: stationGroupedData
      }, () => {
        wx.nextTick(() => {
          this.queryLetterIndexPositions();
        });

        // 初始加载：先加载字母 'A' 的所有站点
        const initialLetter = 'A';
        if (letters.includes(initialLetter)) {
          this.loadStationsByLetter(initialLetter, true);

          // 加载完 'A' 后，从 'B' 开始进行顺序加载
          const startSequentialLetterIndex = letters.indexOf('B');
          if (startSequentialLetterIndex !== -1) {
            setTimeout(() => {
              this.sequentialLoadingIndex = startSequentialLetterIndex;
              this.startSequentialLoading();
            }, 300);
          }
        } else {
          if (letters.length > 0) {
            this.sequentialLoadingIndex = 0;
            setTimeout(() => {
              this.startSequentialLoading();
            }, 300);
          }
        }
      });
    },
    detached() {
      // 组件移除时断开观察器 (已移除)
    }
  },
  observers: {
    'show': function(show) {
      // 组件显示时重置搜索状态
      if (show) {
        this.setData({
          searchKeyword: '',
          searchResults: []
        });
      }
    }
  },
  methods: {
    // 查询侧边字母索引项的位置
    queryLetterIndexPositions(retries = 0) {
      const MAX_RETRIES = 10;

      if (!this.data.show) {
        return;
      }
      const query = wx.createSelectorQuery().in(this);
      query.selectAll('.letter-index .letter-item').boundingClientRect(rects => {
        const isValid = rects && rects.length > 0 && rects.some(rect => rect.height > 0 || rect.top > 0);

        if (!isValid && retries < MAX_RETRIES) {
          setTimeout(() => this.queryLetterIndexPositions(retries + 1), 100);
          return;
        } else if (!isValid) {
          this.letterIndexPositions = [];
          return;
        }

        const positions = rects.map(rect => ({ top: rect.top, height: rect.height }));
        this.letterIndexPositions = positions;
      }).exec();
    },

    // 启动顺序加载
    startSequentialLoading() {
      const letters = this.data.letterList;
      const currentIndex = this.sequentialLoadingIndex;

      if (this.isSequentialLoading || currentIndex >= letters.length) {
        return;
      }

      this.isSequentialLoading = true;

      const loadNextLetter = () => {
        const letter = letters[this.sequentialLoadingIndex];
        if (!letter) {
          this.isSequentialLoading = false;
          this.sequentialLoadingTimer = null;
          return;
        }

        const loadedCount = this.data.groupedStations[letter]?.length || 0;
        const totalCount = this.data.stationData[letter]?.length || 0;

        if (loadedCount < totalCount || totalCount === 0) {
          this.loadStationsByLetter(letter, false);
        }

        this.sequentialLoadingIndex++;

        if (this.sequentialLoadingIndex < letters.length) {
          this.sequentialLoadingTimer = setTimeout(loadNextLetter, 50);
        } else {
          this.isSequentialLoading = false;
          this.sequentialLoadingTimer = null;
        }
      };

      loadNextLetter();
    },

    // 处理字母索引的触摸开始事件
    onTouchStart(e) {
      if (this.isSequentialLoading) {
        if (this.sequentialLoadingTimer) {
          clearTimeout(this.sequentialLoadingTimer);
          this.sequentialLoadingTimer = null;
        }
        this.isSequentialLoading = false;
      }
    },

    // 处理字母索引的触摸移动事件
    onTouchMove(e) {
      const touchY = e.touches[0].clientY;
      const letterList = this.data.letterList;
      const letterIndexPositions = this.letterIndexPositions;

      if (!letterIndexPositions || letterIndexPositions.length === 0) {
        return;
      }

      let touchedLetter = null;
      for (let i = 0; i < letterIndexPositions.length; i++) {
        const { top, height } = letterIndexPositions[i];
        if (touchY >= top && touchY < top + height) {
          touchedLetter = letterList[i];
          break;
        }
      }

      if (touchedLetter) {
        if (touchedLetter !== this.data.activeLetterIndex || !this.data.scrollViewTarget) {
          this.setData({
            activeLetterIndex: touchedLetter,
            scrollViewTarget: touchedLetter
          });

          this.loadStationsByLetter(touchedLetter, true);

          if (this.isSequentialLoading) {
            if (this.sequentialLoadingTimer) {
              clearTimeout(this.sequentialLoadingTimer);
              this.sequentialLoadingTimer = null;
            }
            this.isSequentialLoading = false;
          }
        }
      }
    },

    // 处理字母索引的触摸结束事件
    onTouchEnd(e) {
      setTimeout(() => {
        this.startSequentialLoading();
      }, 300);
    },

    // 加载指定字母的站点数据
    loadStationsByLetter(e, loadFull = false) {
      const letter = e.currentTarget?.dataset?.letter || e;
      if (!letter) {
        return;
      }

      const loadedCount = this.data.groupedStations[letter]?.length || 0;
      const totalCount = this.data.stationData[letter]?.length || 0;

      if ((loadedCount > 0 && loadedCount >= totalCount) || (totalCount === 0 && loadedCount > 0)) {
        return;
      }

      const stations = this.data.stationData[letter] || [];
      let stationsToLoad;

      if (loadFull) {
        stationsToLoad = stations;
      } else {
        const start = loadedCount;
        const countToLoad = this.data.pageSize;
        const end = start + countToLoad;
        stationsToLoad = stations.slice(start, end);

        if (stationsToLoad.length === 0 && start > 0) {
          return;
        }
      }

      const currentStations = this.data.groupedStations[letter] || [];
      const updatedStations = (loadFull || loadedCount === 0) ? stationsToLoad : [...currentStations, ...stationsToLoad];

      this.setData({
        groupedStations: {
          ...this.data.groupedStations,
          [letter]: updatedStations
        }
      });
    },

    // 加载更多站点
    loadMoreStations() {
      const { activeLetterIndex } = this.data;
      if (!activeLetterIndex) {
        return;
      }
      this.loadStationsByLetter({ currentTarget: { dataset: { letter: activeLetterIndex } } });
    },

    // 处理字母索引项的点击事件
    onLetterTap(e) {
      const tappedLetter = e.currentTarget.dataset.item;
      if (tappedLetter) {
        this.setData({
          activeLetterIndex: tappedLetter,
          currentLetter: tappedLetter,
          scrollViewTarget: tappedLetter
        });
        this.loadStationsByLetter(tappedLetter, true);
      }
    },

    // 处理主列表中字母部分标题的点击事件
    onLetterIndexTap(e) {
      const tappedLetter = e.currentTarget.dataset.letter;
      if (tappedLetter) {
        this.setData({
          activeLetterIndex: tappedLetter,
          currentLetter: tappedLetter,
          scrollViewTarget: tappedLetter
        });
        this.loadStationsByLetter(tappedLetter, true);
      }
    },

    // 关闭选择器
    onClose() {
      this.setData({
        searchKeyword: '',
        searchResults: []
      });
      this.triggerEvent('close');
    },

    // 选择站点
    onSelect(e) {
      const station = e.currentTarget.dataset.station;
      this.triggerEvent('select', { station });
      this.triggerEvent('close');
    },

    // 搜索站点
    searchInput(e) {
      const keyword = e.detail.value.toLowerCase();
      this.setData({ searchKeyword: keyword });

      if (!keyword) {
        this.setData({ searchResults: [] });
        return;
      }

      const results = [];
      Object.values(this.data.stationData).forEach(stations => {
        stations.forEach(station => {
          if (station.name.includes(keyword) ||
              station.pinyin.includes(keyword) ||
              station.abbr.includes(keyword)) {
            results.push(station);
          }
        });
      });

      this.setData({ searchResults: results.slice(0, 80) });
    }
  }
});