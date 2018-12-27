
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-') 
}
const formatHM = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()

  return [hour, minute].map(formatNumber).join(':')
}
function dateFromString(time) {
  //var time = "2014-08-12 09:25:24 "
  time = time.replace(/-/g, ':').replace(' ', ':')
  time = time.split(':')
  var time1 = new Date(time[0], (time[1] - 1), time[2], time[3], time[4], time[5])
  return time1
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

const newAppointment = (pUserInfo, pTitle, pDate, pTimeStart, pTimeEnd, pPlace, pLiaisons, pTips) => {
  let rtApt = {};

  rtApt.creatorAv = pUserInfo.avatarUrl;
  rtApt.creatorNn = pUserInfo.nickName;

  rtApt.title = pTitle;

  rtApt.date = pDate;
  rtApt.timeStart = pTimeStart;
  rtApt.timeEnd = pTimeEnd;

  rtApt.place = pPlace;
  rtApt.liaisons = pLiaisons;
  rtApt.tips = pTips;

  rtApt.records = [];

  rtApt.messBoard = [];

  return rtApt;
}

const newRecord = (pUserInfo) => {//1:出席 0:待定 -1:拒绝
  let rtRecord = {};
  rtRecord.attends = "join";
  if (pUserInfo) {
    rtRecord.openId = pUserInfo.openId;
    rtRecord.avatarURL = pUserInfo.avatarUrl;
    rtRecord.nickName = pUserInfo.nickName;
  } 
  return rtRecord;
}

const showAptList = (pList) => {
  var tList = deepClone(pList);
  for (var i in tList) {
    tList[i] = showAppointment(tList[i])
  }
  return tList
}

const showAppointment = (pApt, pUserInfo = null) => {
  var tApt = deepClone(pApt)
  tApt.date = formatDate(new Date(tApt.date))
  tApt.timeStart = formatHM(new Date(tApt.timeStart))
  tApt.timeEnd = formatHM(new Date(tApt.timeEnd))

  if (tApt.date < formatDate(new Date())){
    tApt.overDue=true
  }else{
    tApt.overDue=false
  }
  
  if (pUserInfo !== null) {
    tApt.logged = true
    if (tApt._openid == pUserInfo.openId){
      tApt.editAble=true
    }else{
      tApt.editAble=false
    }

    for (var i in tApt.records) {
      if(tApt.records[i]==null){continue}
      if (tApt.records[i].openId == pUserInfo.openId) {
        tApt.attends = "join"
      }
    }
  }
  else{
    tApt.logged=false
  }
  return tApt
}

var deepClone = (a) => {
  var c = {};
  //console.log("a",a)
  c = JSON.parse(JSON.stringify(a));
  //console.log("c", c)
  return c;
}


module.exports = { formatTime, formatDate, formatHM, dateFromString, showBusy, showSuccess, showModel, newAppointment, newRecord, showAptList, showAppointment, deepClone}
