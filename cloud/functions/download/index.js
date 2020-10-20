// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const fileID = event.fileID
  const res = await cloud.downloadFile({
    fileID: fileID,
  })
  const buffer = res.fileContent
  return buffer.toString('utf8')
}