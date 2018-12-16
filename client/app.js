//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    onLaunch: function () {
      qcloud.setLoginUrl(config.service.loginUrl)
      wx.cloud.init({ env: 'test-f83f7a' });
      this.globalData.db = wx.cloud.database();
      this.globalData.aptCollection = this.globalData.db.collection('hangout_apt');
      this.globalData.userCollection = this.globalData.db.collection('hangout_user');
    },

    globalData: {
      userInfo: null,
      db: null,
      aptCollection: null,
      userCollection: null,
    }
})