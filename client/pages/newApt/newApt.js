// client/pages/newApt/newApt.js
var util = require('../../utils/util.js')

var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    aptName:"",
    aptDate: util.formatDate(new Date()),
    aptTimeStart: util.formatHM(new Date()),
    aptTimeEnd: util.formatHM(new Date()),

    today: util.formatDate(new Date()),
    now: util.formatHM(new Date()),
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

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    let { Title, Place, Liaisons, Tips } = e.detail.value;
    if (!Title || !Place) {
      this.setData({
        warn: "缺少必须的信息！",
        isSubmit: true
      })
      return;
    }


    this.setData({
      warn: "",
      isSubmit: true,
    });
    var tUserInfo = app.globalData.userInfo;
    var tAptDate = this.data.aptDate;
    var tAptTimeStart = this.data.aptTimeStart;
    var tAptTimeEnd = this.data.aptTimeEnd;

    var newApt = util.newAppointment(tUserInfo, Title, tAptDate, tAptTimeStart, tAptTimeEnd, Place, Liaisons, Tips);
    this.addRecord(newApt);
  },
  addRecord: function (pApt) {
    const col = app.globalData.aptCollection;
    col.add({
      data: pApt,
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        //console.log(res)    
        wx.navigateBack()
      }
    })
  },

  formReset: function () {
    console.log('form发生了reset事件');
    this.setData({
      DateEnd: util.formatDate(new Date()),
    })
  },

  bindDateChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      aptDate: e.detail.value
    })
  },
  bindTimeStartChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      aptTimeStart: e.detail.value
    })
  },
  bindTimeEndChange: function (e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      aptTimeEnd: e.detail.value
    })
  },
})