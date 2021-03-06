// client/pages/siteNew/siteNew.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    checkboxItems: [
      { name: '足球', value: '足球', checked: true },
      { name: '篮球', value: '篮球' },
      { name: '网球', value: '网球' },
      { name: '羽毛球', value: '羽毛球' }
    ],

    countryCodes: ["+86", "+80", "+84", "+87"],
    countryCodeIndex: 0,

    countries: ["中国", "美国", "英国"],
    countryIndex: 0,

    accounts: ["微信号", "QQ", "Email"],
    accountIndex: 0,

    isAgree: false,

    addressBean:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail);

    var checkboxItems = this.data.checkboxItems, values = e.detail.value;
    for (var i = 0, lenI = checkboxItems.length; i < lenI; ++i) {
      checkboxItems[i].checked = false;

      for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
        if (checkboxItems[i].value == values[j]) {
          checkboxItems[i].checked = true;
          break;
        }
      }
    }

    this.setData({
      checkboxItems: checkboxItems
    });
  },
  bindMap: function (e) {
    var tURL = '../toolMap/toolMap'
    var tAddress = this.data.addressBean.address
    var tLocation = this.data.addressBean.location
    if (typeof (tLocation)!=='undefined'){
      tURL = tURL + '?address=' + tAddress + '&longitude=' + tLocation.lng + '&latitude=' + tLocation.lat
    };
    wx.navigateTo({
      url: tURL
    })
  },
})