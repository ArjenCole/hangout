const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

const newAppointment = userInfo => {
  let rtApt = {};

  rtApt.creatorId = userInfo.openId;
  rtApt.creatorAv = userInfo.avatarUrl;
  rtApt.creatorNn = userInfo.nickName;

  rtApt.title = "新活动";

  rtApt.timeStart = new Date();
  rtApt.timeEnd = new Date();

  rtApt.place = "";
  rtApt.liaisons = "";

  rtApt.records = [];

  rtApt.messBoard = [];

  return rtApt;
}

const newRecord = (userInfo, attend = 1, pending = 0, openId = "", avatarUrl = "", nickName = "") => {
  let rtRecord = {};
  rtRecord.attend = attend;
  rtRecord.pending = pending;
  if (userInfo) {
    rtRecord.openId = userInfo.openId;
    rtRecord.avatarURL = userInfo.avatarUrl;
    rtRecord.nickName = userInfo.nickName;
  } else {
    rtRecord.openId = openId;
    rtRecord.avatarURL = avatarUrl;
    rtRecord.nickName = nickName;
  }
  return rtRecord;
}


module.exports = { formatTime, showBusy, showSuccess, showModel, newAppointment, newRecord }
