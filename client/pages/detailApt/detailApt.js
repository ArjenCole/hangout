// client/pages/detailApt/detailApt.js
var util = require('../../utils/util.js')
var app=getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    apt: {},
    showApt: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.getApt(options.aptId)
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

  bindJoinTap: function () {
    this.updateApt(this.updateArr(this.data.apt.records, 1))
  },

  updateArr: function (pArr, pAttends) {
    var tArr = util.deepClone(pArr)
    console.log(app.globalData.userInfo)
    var tRecord = util.newRecord(app.globalData.userInfo, pAttends)
    var flag = false;
    for (var i in tArr) {
      if (tArr[i]._openid == app.globalData.userInfo._openid) {
        tArr[i] = tRecord
        flag=true
      }
    }
    if (!flag) { tArr.push(tRecord)}
    return tArr
  },

  getApt: function (pId) {
    var that = this;
    app.globalData.aptCollection.where({
      _id: pId
    }).get({
      success: function (res) {
        that.setData({ 
          apt: res.data[0],
          showApt: util.showAppointment(res.data[0])
        })
      }
    })
  },
  updateApt: function (pRecords){
    var that = this
    var tID = this.data.apt._id;
    app.globalData.aptCollection.doc(tID).update({
      data: {
        records: pRecords
      },
      success: function (res) {
        that.checkUser()
      },
      fail: function (e) {
        console.log(e);
      }
    })
  },
  checkUser: function () {
    var that = this;
    app.globalData.userCollection.where({
      _openid: app.globalData.userInfo.openId
    }).get({
      success: function (res) {
        if(res.data.length==0){
          that.addUser()
        } else {
          that.updateUser()
        }
      }
    })
  },
  addUser: function () {
    var tUser={}
    tUser.apts=[]
    tUser.apts.push(this.data.apt._id)
    const col = app.globalData.userCollection;
    col.add({
      data: tUser,
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log("add?")
      }
    })
  },
  updateUser: function () {
    var tID = app.globalData.userInfo.openId;
    console.log("tID", app.globalData.userInfo)
    const _ = app.globalData.db.command
    app.globalData.userCollection.doc(tID).update({
      data: {
        apts: _.push(this.data.apt._id)
      },
      success: function (res) {
        console.log("res")
      },
      fail: function (e) {
        console.log(e);
      }
    })
  }
})