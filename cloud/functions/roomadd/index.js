// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  //event参数是小程序调用时传入的参数，它本身自带一个字段userInfo，其中包含用户的openId和小程序的appId
  //const wxContext = cloud.getWXContext()
  var userid = event.userid
  var roomid = event.room_num
  //user.openid = wxContext.OPENID
  console.log('event'+event)
  console.log(userid)
  console.log(roomid)
  var r = await db.collection('rooms').where({room_id: roomid}).get()
  if (r.data.length > 0) { //room already exist - for user2
    //console.log("user2 add:" + r.data.user2_openid)
    if (r.data[0].user1_openid == userid)
      return Promise.resolve("room_created_forone")
    else{
      var p = await db.collection('rooms').where({ //yuanxian 'await'
        room_id: roomid
      }).update({
        data: {
          user2_openid: userid
        }
      })
      return Promise.resolve("room_already_fortwo")
    }
  } 
  else {//room need to be created - for user1
    let p = await db.collection('rooms').add({//yuanxian 'await'
      data: {
        room_id: roomid,
        user1_openid: userid
      }
    })
    //p.then(function(promisevalue){
   //   console.log(promisevalue)
    //})
    if (p._id && p._id != '') {
      return Promise.resolve("room_created_forone")
    }
    else {
      return Promise.resolve('roomadd cloud fail')
    }
 }

  /*
  db.collection('rooms').where({room_id: roomid}).get({
    success:function(r){
      console.log("user2 add:" + r.data.user2_openid)
      let p = db.collection('rooms').where({ //yuanxian 'await'
        room_id: roomid
      }).update({
        data: {
          user2_openid: userid
        }
      })
      return Promise.resolve("room_already_fortwo")
    },fail:function(r){
      let p = db.collection('rooms').add({//yuanxian 'await'
        data: {
          room_id: roomid,
          user1_openid: userid
        }
      })
      if (p._id && p._id != '') {
        return Promise.resolve("room_created_forone")
      }
      else {
        return Promise.reject('roomadd cloud fail')
      }
    }
  })
  */

}