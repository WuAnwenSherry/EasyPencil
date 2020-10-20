// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var user = event.user
  user.openid = wxContext.OPENID
  console.log(user)
  var r = await db.collection('user').where({
    openid: user.openid
  }).get()
  if (r.data.length > 0) {
    console.log("update_user:" + r.data)
    let p = await db.collection('user').where({
      openid: user.openid
    }).update({
      data: {
        visit_times: r.data[0].visit_times + 1,
      }
    })
    return Promise.resolve(user.openid)
  } else {
    let p = await db.collection('user').add({
      data: user
    })
    if (p._id && p._id != '') {
      return Promise.resolve(user.openid)
    }
    else {
      return Promise.reject('penciladd cloud fail')
    }
  }
}