// pages/prize/prize.js
var util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgBG: "../../res/post/backGround.png",
    maskHidden: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  //将canvas转换为图片保存到本地，然后将图片路径传给image图片的src
  createNewImg: function () {
    var pages = getCurrentPages()
    var currPage = pages[pages.length - 1]  //当前页面
    var prevPage= pages[pages.length - 2]
    var tApt = util.showAppointment(prevPage.data.apt, app.globalData.userInfo) 

    var that = this;
    var context = wx.createCanvasContext('mycanvas');
    context.setFillStyle("#ffe200")
    context.fillRect(0, 0, 375, 667)
    //将模板图片绘制到canvas
    context.drawImage(this.data.imgBG, 0, -50, 375, 750);

    context.setFontSize(48);
    context.setFillStyle('#fff');
    context.setTextAlign('center');
    context.fillText(tApt.title, 185, 100);
    context.stroke();

    context.setFontSize(16);
    context.setFillStyle('#fff');
    context.setTextAlign('left');
    context.fillText("发起人："+tApt.creatorNn, 30, 150);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("日期：" + tApt.date, 30, 190);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("时间：" + tApt.timeStart + "~" + tApt.timeEnd, 30, 230);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("地点：" + tApt.place, 30, 270);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("联系人：" + tApt.liaisons, 30, 310);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("备注：" + tApt.tips, 30, 350);
    context.stroke();

    context.draw();
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          that.setData({
            imagePath: tempFilePath,
            canvasHidden: true
          });
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 200);
  },
  //点击保存到相册
  baocun: function () {
    console.log(1)
    var that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.imagePath,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                maskHidden: false
              })
            }
          }, fail: function (res) {
            console.log(11111)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    this.setData({
      maskHidden: false
    });
    wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 1000
    });
    setTimeout(function () {
      wx.hideToast()
      that.createNewImg();
      that.setData({
        maskHidden: true
      });
    }, 1000)
  },

})