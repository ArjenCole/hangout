// pages/prize/prize.js
var util = require('../../utils/util.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgBG: "",
    maskHidden: false,
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.showBusy('正在生成')
    this.downloadBackGroundPic()
  },
  downloadBackGroundPic: function () {
    var that = this
    wx.cloud.downloadFile({
      fileID: "cloud://test-f83f7a.7465-test-f83f7a/post/postBackGround.PNG"
    }).then(res => {
      that.setData({
        imgBG: res.tempFilePath
      })
      that.drawPost()
    }).catch(error => {
      console.log(error)
    })
  },

  drawPost: function () {
    var that = this;
    this.setData({
      maskHidden: false
    });
    /*wx.showToast({
      title: '生成中...',
      icon: 'loading',
      duration: 1000
    });*/
    setTimeout(function () {
      wx.hideToast()
      that.createNewImg();
      that.setData({
        maskHidden: true
      });
    }, 1000)
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


    context.setFillStyle("rgba(255, 255, 255, 0.651)")
    context.fillRect(25, 160, 325, 260)
    //context.drawImage("", 25, 140, 325, 300) 

    context.setFontSize(48);
    context.setFillStyle('#fff');
    context.setTextAlign('center');
    context.fillText(tApt.title, 185, 100);
    context.stroke();

    var leftDis=40
    var rightDis=375-leftDis


    context.setFontSize(16);
    context.setFillStyle('#fff');
    context.setTextAlign('left');
    context.fillText("发起人："+tApt.creatorNn, leftDis, 150);
    context.stroke();

    context.setFontSize(18);
    context.setFillStyle('#000');
    context.setTextAlign('left');
    context.fillText("日期：", leftDis, 190);
    context.setTextAlign('right');
    context.fillText(tApt.date, rightDis, 190);
    context.stroke();

    context.setTextAlign('left');
    context.fillText("时间：", leftDis, 230);
    context.setTextAlign('right');
    context.fillText(tApt.timeStart + "~" + tApt.timeEnd, rightDis, 230);
    context.stroke();

    context.setTextAlign('left');
    context.fillText("地点：", leftDis, 270);
    context.setTextAlign('right');
    context.fillText(tApt.place, rightDis, 270);
    context.stroke();

    context.setTextAlign('left');
    context.fillText("联系人：", leftDis, 310);
    context.setTextAlign('right');
    context.fillText(tApt.liaisons, rightDis, 310);
    context.stroke();

    context.setTextAlign('left');
    context.fillText("备注：", leftDis, 350);
    context.setTextAlign('right');
    context.fillText(tApt.tips, rightDis, 350);
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
          util.showSuccess('生成成功')
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 200);
  },
  //点击保存到相册
  bindSaveImage: function () {
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
              wx.navigateBack()
            }
          }, fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },



})