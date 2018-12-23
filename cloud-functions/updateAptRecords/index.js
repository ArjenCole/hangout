// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'test-f83f7a',
  traceUser: true,
})
const db = cloud.database()
const aptCollection = db.collection('hangout_apt');
const userCollection = db.collection('hangout_user');
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await aptCollection.doc(event.pId).update({
      data: {
        records: event.pRecords
      }
    })
  } catch (e) {
    console.error(e)
  }
}