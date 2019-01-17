// canvas 全局配置
var context = null;// 使用 wx.createContext 获取绘图上下文 context
var isButtonDown = false; //指尖是否接触
var arrx = [];
var arry = [];
var arrz = [];
var canvasw = 0;
var canvash = 0;
var linewidth = 1;
var eraser = false;
var color_R = 0;
var color_G = 0;
var color_B = 0;
//获取系统信息
wx.getSystemInfo({
  success: function (res) {
    canvasw = res.windowWidth;//设备宽度
    canvash = res.windowHeight;
  }
});
//data:{
// rubberison:false
//  showModal:false
//  clickId:-1
// colorArray: ['#A9D1BD', '#71CC51', '#9DAA4A', '#6B7139', '#666339', '#5A523C']
//}
//注册页面-
Page({
  data: {
    rubberison: false,
    showModal: false,
    clickId: -1,
    colorselected: 'white',
    color_text: 'color_default',
    colorNeutraltext: ['OffWhite', 'Cream', 'Beige', 'Sand', 'Camel', 'Brown'],
    colorNeutral: ['#EFEEE5', '#E8E1C7', '#CDBB99', '#A69373', '#967353', '#664D3B'],
    colorGreytext: ['Silver', 'LightGrey', 'LightCoolGrey', 'Grey', 'DarkGrey', 'Charcoal'],
    colorGrey: ['#BDBEBF', '#ABB1B3', '#7A8387', '#6A6A6A', '#3F3E47', '#2D3036'],
    colorBluetext: ['LightBlue', 'SeaBlue', 'Turquoise', 'Lavender', 'Royal', 'Navy'],
    colorBlue: ['#A1CCDE', '#00A4B5', '#008CB7', '#9B90C8', '#2E4DA7', '#373E4B'],
    colorYellowtext: ['Yellow', 'Gold', 'Ochre', 'Orange', 'Bronze', 'Rust'],
    colorYellow: ['#F6C324', '#CA981E', '#C4994B', '#DD7A39', '#91672C', '#9F5235'],
    colorPinktext: ['Pink', 'DeepPink', 'Fuchsia', 'Red', 'Burgundy', 'Purple'],
    colorPink: ['#E38FB7', '#FF1493', '#CB2F70', '#BC243C', '#852839', '#473053'],
    colortext: ['Mint', 'AppleGreen', 'Green', 'ArmyGreen', 'Olive', 'Khaki'],
    colorArray: ['#A9D1BD', '#71CC51', '#9DAA4A', '#6B7139', '#666339', '#5A523C'],
  },

  canvasIdErrorCallback: function (e) {
    console.error(e.detail.errMsg)
  },

  canvasStart: function (event) {
    isButtonDown = true;
    arrz.push(0);
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);
  },

  canvasMove: function (event) {
    if (isButtonDown) {
      arrz.push(1);
      arrx.push(event.changedTouches[0].x);
      arry.push(event.changedTouches[0].y);
    }

    context.beginPath()
    context.setLineWidth(linewidth)
    for (var i = 0; i < arrx.length; i++) {
      if (arrz[i] == 0) {
        context.moveTo(arrx[i], arry[i])
      } else {
        context.lineTo(arrx[i], arry[i])
      }
    }
    context.stroke()
    context.draw(true)
  },

  canvasEnd: function (event) {
    isButtonDown = false;
    arrx = [];
    arry = [];
    arrz = [];
  },
  bolder: function () {
    if (linewidth < 10)
      linewidth++;
    else
      linewidth = 10;
  },
  thinner: function () {
    if (linewidth > 1)
      linewidth--;
    else
      linewidth = 1;
  },
  rubber: function () {
    eraser = !eraser;
    this.setData({
      rubberison: !this.data.rubberison
    })
    if (eraser) {
      context.setStrokeStyle('white');
      context.setLineWidth(linewidth + 8);
    }
    else {
      context.setStrokeStyle('#000000');
      context.setLineWidth(linewidth);
    }
  },
  colorchoose: function () {
    this.setData({
      showModal: true
    })
  },
  changeNeutralColor: function (e) {
    this.setData({
      colorselected: this.data.colorNeutral[e.currentTarget.id],
      color_text: this.data.colorNeutraltext[e.currentTarget.id]
    })
  },
  changeGreyColor: function (e) {
    this.setData({
      colorselected: this.data.colorGrey[e.currentTarget.id],
      color_text: this.data.colorGreytext[e.currentTarget.id]
    })
  },
  changeBlueColor: function (e) {
    this.setData({
      colorselected: this.data.colorBlue[e.currentTarget.id],
      color_text: this.data.colorBluetext[e.currentTarget.id]
    })
  },
  changeYellowColor: function (e) {
    this.setData({
      colorselected: this.data.colorYellow[e.currentTarget.id],
      color_text: this.data.colorYellowtext[e.currentTarget.id]
    })
  },
  changePinkColor: function (e) {
    //var index=0;
    //console.log(e.currentTarget.id);
    //console.log(this.data.colorArray);
    this.setData({
      colorselected: this.data.colorPink[e.currentTarget.id],
      color_text: this.data.colorPinktext[e.currentTarget.id]
    })
  },
  changeColor: function (e) {
    //var index=0;
    console.log(e.currentTarget.id);
    console.log(this.data.colorArray);
    this.setData({
      colorselected: this.data.colorArray[e.currentTarget.id],
      color_text: this.data.colortext[e.currentTarget.id]
    })
  },
  onConfirm: function () {
    context.setStrokeStyle(this.data.colorselected);
    this.hideModal();
  },
  cleardraw: function () {
    //清除画布
    arrx = [];
    arry = [];
    arrz = [];
    context.clearRect(0, 0, canvasw, canvash);
    context.draw(true);
  },
  //export按钮的getimg
  getimg: function () {
    /*
    if (arrx.length == 0) {
      wx.showModal({
        title: 'Warning',
        content: 'No pic no save！',
        showCancel: false
      });
      return false;
    };
    */
    var filetemp;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 300,
      height: 500,
      destWidth: 300,
      destHeight: 500,
      canvasId: 'canvas',
      success: function (res) {
        filetemp = res.tempFilePath;
        console.log(res.tempFilePath);
      }
    });
    wx.getSetting({
      success(res) {
        // 如果没有则获取授权
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success() {
              console.log("get authorized");
              wx.saveImageToPhotosAlbum({
                filePath: filetemp,
                success() {
                  wx.showToast({
                    title: 'Save success'
                  });
                },
                fail() {
                  wx.showToast({
                    title: 'Save failure'
                  });
                }
              });
            },
            fail() {
              console.log("fail to get authorized");
            }
          });
        }
        else {
          wx.saveImageToPhotosAlbum({
            filePath: filetemp,
            success() {
              wx.showToast({
                title: 'Save success'
              });
            },
            fail() {
              wx.showToast({
                title: 'Save failure'
              });
            }
          });
        }
      }
    });


  },
  /**
   * 页面的初始数据
   */
  hideModal: function () {
    this.setData({
      showModal: false

    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 使用 wx.createContext 获取绘图上下文 context
    context = wx.createCanvasContext('canvas');
    context.beginPath();
    context.setStrokeStyle('#000000');
    //context.setLineWidth(1);
    context.setLineCap('round');
    context.setLineJoin('round');
  }
})//注册页面-end-