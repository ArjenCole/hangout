// client/pages/newApt/newApt.js
var util = require('../../utils/util.js')

var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inApt: null,//传入的apt
    showApt: null,

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
    if (typeof(options.aptId) == "undefined") { return }
    var pages = getCurrentPages();
    var currPage = pages[pages.length - 1];   //当前页面
    var prevPage = pages[pages.length - 2];   //前页面

    var prevApt =prevPage.data.apt
    this.setData({
      inApt: prevApt,
      showApt: util.showAppointment(prevApt, app.globalData.userInfo),
      aptDate: util.formatDate(prevApt.date),
      aptTimeStart: util.formatHM(prevApt.timeStart),
      aptTimeEnd: util.formatHM(prevApt.timeEnd),
    })
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

    util.showBusy('正在提交')

    this.setData({
      warn: "",
      isSubmit: true,
    });
    var tUserInfo = app.globalData.userInfo;
    var tAptDate = new Date(this.data.aptDate) 
    var tAptTimeStart = util.dateFromString(this.data.aptDate + " " + this.data.aptTimeStart + ":00 ")
    var tAptTimeEnd = util.dateFromString(this.data.aptDate + " " + this.data.aptTimeEnd + ":00 ")

    var newApt = util.newAppointment(tUserInfo, Title, tAptDate, tAptTimeStart, tAptTimeEnd, Place, Liaisons, Tips);
    if (this.data.inApt !== null) {
      newApt._id = this.data.inApt._id
      newApt._openid = this.data.inApt._openid
      newApt.records = this.data.inApt.records
      this.updateApt(newApt)
    } else {
      this.addRecord(newApt)
    }
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
  bindSelectSite: function (e) {
    wx.navigateTo({
      url: '../site/site'
    })
  },

  updateApt: function (pApt) {
    app.globalData.aptCollection.doc(pApt._id).update({
      data: {
        title:pApt.title,
        date: pApt.date,
        timeStart: pApt.timeStart,
        timeEnd: pApt.timeEnd,
        place:pApt.place,
        liaisons:pApt.liaisons,
        tips:pApt.tips
      },
      success: function (res) {
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];   //当前页面
        var prevPage = pages[pages.length - 2]; 
        prevPage.setData({
          apt: pApt,
          showApt: util.showAppointment(pApt, app.globalData.userInfo)
        })
        util.showSuccess('提交成功')

        wx.navigateBack()
        //console.log(res);
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },
})