// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //event参数是小程序调用时传入的参数，它本身自带一个字段userInfo，其中包含用户的openId和小程序的appId
  const wxContext = cloud.getWXContext()
  //let { userInfo, a, b } = event
  var user = event.user
  //user.openid=event.userInfo.openid
  user.openid = wxContext.OPENID
  console.log(user)
  //let { OPENID, APPID } = cloud.getWXContext() // 这里获取到的 openId 和 appId 是可信的
  var r = await db.collection('client').where({
    openid: user.openid
  }).get()
  if (r.data.length > 0) {
    console.log("update_r:" + r.data)
    let p = await db.collection('client').where({
      openid: user.openid
    }).update({
      data: {
        room_num: Math.random().toString(36).substr(2, 15),
        //visit_times: 1,
        //connect: false
      }
    })
    return Promise.resolve(user.openid)
    //return new Promise(function (resolve, reject) {
    //  resolve(user.openid);  
    //})
  } else {
    let p = await db.collection('client').add({
      data: user
    })
    if (p._id && p._id != '') {
      return Promise.resolve(user.openid)
    }
    else {
      return Promise.reject('penciladd cloud fail')
    }
  }
  /*
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
    sum
  }
  */
}