// client/pages/toolMap/toolMap.js
//获取应用实例
const app = getApp();
const defaultScale = 14;
//var consoleUtil = require('../../utils/consoleUtil.js');
var constant = require('../../utils/constant.js');
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
//定义全局变量
var wxMarkerData = [];
var topHeight = 0;
var windowHeight = 0;
var windowWidth = 0;
var mapId = 'myMap';
var qqmapsdk;


Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    longitude: '',
    latitude: '',
    //地图缩放级别
    scale: defaultScale,
    markers: [],
    warningText: '顶部提示',
    //showUpload: true,
    //地图高度
    mapHeight: 0,
    infoAddress: '',
    commentCount: 0,
    praiseCount: 0,
    commentList: [],
    selectAddress: '',
    inputAddress: '',
    centerLongitude: '',
    centerLatitude: '',
    uploadImagePath: '',
    currentMarkerId: 0,
    praiseSrc: '../../res/bottom-unpraise.png',
    warningIconUrl: '',
    infoMessage: '',
    isUp: false,
    //中心指针，不随着地图拖动而移动
    controls: [],
    //搜索到的中心区域地址信息,用于携带到选择地址页面
    centerAddressBean: null,
    //选择地址后回调的实体类
    callbackAddressInfo: null,
    //将回调地址保存
    callbackLocation: null,
    //当前省份
    currentProvince: '',
    //当前城市
    currentCity: '',
    //当前区县
    currentDistrict: '',
    homeActionLeftDistance: '0rpx',
    //单个 marker 情报
    currentTipInfo: '',
    //是否获得地图权限
    authorizeMap:false,
  },

  onLoad: function (options) {
    console.log('onLoad')
    var that = this;
    if (typeof (options.longitude) !== 'undefined') {
      var tLocation = {}
      tLocation.longitude = parseFloat(options.longitude)
      tLocation.latitude = parseFloat(options.latitude)
      var tCallbackAddressInfo = {}
      tCallbackAddressInfo.title=options.address
      tCallbackAddressInfo.location=tLocation
      this.setData({
        callbackAddressInfo: tCallbackAddressInfo
      })
    } 
    that.requestAuth();
    //that.scopeSetting();
  },

  onShow: function () {
    console.log('onShow');
    var that = this;
    that.changeMapHeight();
    that.setHomeActionLeftDistance();
    if(!that.data.authorizeMap){return}
    if (that.data.callbackAddressInfo == null) {
        that.requestLocation();
    } else {
      //如果刚从选择地址页面带数据回调回来，则显示选择的地址
      that.setData({
        selectAddress: that.data.callbackAddressInfo.title,
        latitude: that.data.callbackAddressInfo.location.latitude,
        longitude: that.data.callbackAddressInfo.location.longitude,
      })
      //置空回调数据，即只使用一次，下次中心点变化后就不再使用
      that.setData({
        callbackAddressInfo: null
      })
    }
  },

  //拖动地图回调
  regionChange: function (res) {
    console.log("region", res)
    var that = this;
    // 改变中心点位置  
    if (res.type == "end" && res.causedBy == "drag") {
      that.getCenterLocation();
    }
  },

  //请求地理位置权限
  requestAuth: function () {
    console.log("requestAuth")
    var that = this;
    wx.getLocation({
      type: 'gcj02',
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          authorizeMap: true,
        })
        console.log('res', res)
        that.initMap()
        that.onShow()
        that.getCenterLocation()
      },
    })
  },

  scopeSetting: function () {
    var that = this;
    wx.getSetting({
      success(res) {
        //地理位置
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success(res) {
              that.initMap();
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '定位失败，你未开启定位权限，点击开启定位权限',
                success: function (res) {
                  if (res.confirm) {
                    wx.openSetting({
                      success: function (res) {
                        if (res.authSetting['scope.userLocation']) {
                          that.initMap();
                        } else {
                          //consoleUtil.log('用户未同意地理位置权限')
                        }
                      }
                    })
                  }
                }
              })
            }
          })
        } else {
          that.initMap();
        }
      }
    })
  },

  /** 
   * 初始化地图
   */
  initMap: function () {
    console.log('initMap')
    var that = this;
    qqmapsdk = new QQMapWX({
      key: constant.tencentAk
    });
    //console.log('initmap')
    //that.getCenterLocation();
  },

  //请求地理位置
  requestLocation: function () {
    console.log("requestLocation")
    var that = this;
    if(that.data.longitude+that.data.latitude==0){
      wx.getLocation({
        type: 'gcj02',
        success: function (res) {
          that.setData({
            latitude: res.latitude,
            longitude: res.longitude,
          })
          console.log("requestLocation_su")
          that.moveTolocation();
        },
      })
    } else{
      that.moveTolocation();
    }

  },

  /**
   * 点击marker
   */
  bindMakertap: function (e) {
    var that = this;
    //设置当前点击的id
    that.setData({
      currentMarkerId: e.markerId
    })
    //重新设置点击marker为中心点
    for (var key in that.data.markers) {
      var marker = that.data.markers[key];
      if (e.markerId == marker.id) {
        that.setData({
          longitude: marker.longitude,
          latitude: marker.latitude,
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: '你点击了marker',
      showCancel: false,
    })
  },


  /**
   * 更新上传坐标点
   */
  updateCenterLocation: function (latitude, longitude) {
    var that = this;
    that.setData({
      centerLatitude: latitude,
      centerLongitude: longitude
    })
  },

  /**
   * 回到定位点
   */
  selfLocationClick: function () {
    var that = this;
    //还原默认缩放级别
    that.setData({
      scale: defaultScale
    })
    //必须请求定位，改变中心点坐标
    that.requestLocation();
  },

  /**
   * 移动到中心点
   */
  moveTolocation: function () {
    console.log("move")
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.moveToLocation();
  },




  /**
   * 点击控件时触发
   */
  controlTap: function () {

  },

  /**
   * 点击地图时触发
   */
  bindMapTap: function () {
    //恢复到原始页
    //this.adjustViewStatus(true, false, false);
  },



  onShareAppMessage: function (res) {

  },



  /**
   * 得到中心点坐标
   */
  getCenterLocation: function () {
    var that = this;
    if (!that.data.authorizeMap) { return }
    console.log('getCenterLocation');
    var mapCtx = wx.createMapContext(mapId);
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('getCenterLocation_su');
        console.log(res);
        that.updateCenterLocation(res.latitude, res.longitude);
        that.regeocodingAddress();
      }
    })
  },

  /**
   * 逆地址解析
   */
  regeocodingAddress: function () {
    var that = this;
    console.log('regeo')
    //不在发布页面，不进行逆地址解析，节省调用次数，腾讯未申请额度前一天只有10000次
    if (!that.data.showConfirm) {
      //return;
    }
    //通过经纬度解析地址
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: that.data.centerLatitude,
        longitude: that.data.centerLongitude
      },
      success: function (res) {
        console.log(res);
        that.setData({
          centerAddressBean: res.result,
          selectAddress: res.result.formatted_addresses.recommend,
          currentProvince: res.result.address_component.province,
          currentCity: res.result.address_component.city,
          currentDistrict: res.result.address_component.district,
        })
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },

  /**
   * 
  showNewMarkerClick: function () {
    var that = this;
    wx.showModal({
      title: '门牌地址',
      content: this.data.centerAddressBean.address_component.nation + " " + this.data.centerAddressBean.address_component.province + " " + this.data.centerAddressBean.address_component.city + " " + this.data.centerAddressBean.address_component.district + " " + this.data.centerAddressBean.address_component.street_number,
      showCancel: false
    })
  },点击顶部横幅提示
  */

  bindSelectLocation: function (e) {
    if (this.data.centerAddressBean == null) { return }
    var prevPage= this.getPrevPage()

    console.log(this.data.centerAddressBean.address_component)
    var tLocation={}
    tLocation.latitude = this.data.centerLatitude
    tLocation.longitude = this.data.centerLongitude
    prevPage.setData({
      address_component: this.data.centerAddressBean.address_component,
      address:this.data.selectAddress,
      location:tLocation
    })
    wx.navigateBack()
  },
/**
 * 设置上传情报按钮的左边距
 */
  setHomeActionLeftDistance: function () {
    var that = this;
    /*if (!that.data.showUpload) {
      return;
    }*/
    wx.getSystemInfo({
      success: function (res) {
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();
        //选择id
        query.select('#home-action-wrapper').boundingClientRect()
        query.exec(function (res) {
          //res就是 所有标签为mjltest的元素的信息 的数组
          //consoleUtil.log(res);
          that.setData({
            homeActionLeftDistance: ((windowWidth - res[0].width) / 2) + 'px'
          })
        })
      }
    })
  },

  changeMapHeight: function () {
    var that = this;
    var count = 0;
    wx.getSystemInfo({
      success: function (res) {
        //consoleUtil.log(res);
        windowHeight = res.windowHeight;
        windowWidth = res.windowWidth;
        //创建节点选择器
        var query = wx.createSelectorQuery();

        var query = wx.createSelectorQuery();
        query.select('#top-layout').boundingClientRect()
        query.exec(function (res) {
          //consoleUtil.log(res);
          topHeight = res[0].height;
          that.setMapHeight();
        })
      },
    })
  },
  setMapHeight: function (params) {
    var that = this;
    that.setData({
      mapHeight: (windowHeight -topHeight) + 'px'
    })
    var controlsWidth = 40;
    var controlsHeight = 48;
    //设置中间部分指针
    that.setData({
      controls: [{
        id: 1,
        iconPath: '../../res/center-location.png',
        position: {
          left: (windowWidth - controlsWidth) / 2,
          top: (windowHeight - topHeight) / 2 - controlsHeight * 3 / 4,
          width: controlsWidth,
          height: controlsHeight
        },
        clickable: true
      }]
    })
  },

  atuoGetLocation(e) {
    var that=this
    console.log("getloc",e)
    qqmapsdk.geocoder({
      address: e,   //用户输入的地址（注：地址中请包含城市名称，否则会影响解析效果），如：'北京市海淀区彩和坊路海淀西大街74号'
      success: function(res) {
        //that.updateCenterLocation(res.result.location.lat, res.result.location.lng);
        that.setData({
          latitude: res.result.location.lat,
          longitude: res.result.location.lng,
        })
        console.log(that.data.longitude,that.data.latitude);   //经纬度对象
        that.updateCenterLocation(res.result.location.lat, res.result.location.lng);
        that.regeocodingAddress();
      } ,
      fail: function(err) {
        console.log('无法定位到该地址，请确认地址信息！');
      }
    })
  },


  //顶部搜索框
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputAddress: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputAddress: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputAddress: e.detail.value
    });
    console.log(this.data.inputAddress)
  },
  inputConfirm: function(e) {
    this.atuoGetLocation(this.data.inputAddress)
  },

  
  getPrevPage: function () {
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];
    return prevPage
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
