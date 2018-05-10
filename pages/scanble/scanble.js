const app = getApp();
/**
 * 搜索设备界面
 */
Page({
  data: {
    logs: [],
    list: [],
  },
  onLoad: function () {
    this.scanBlueTooth();
  },
  onShow: function () {


  },
  //点击事件处理
  bindViewTap: function (e) {
    console.log(e.currentTarget.dataset.title);
    console.log(e.currentTarget.dataset.name);
    console.log(e.currentTarget.dataset.advertisData);

    var title = e.currentTarget.dataset.title;
    var name = e.currentTarget.dataset.name;
    wx.redirectTo({
      url: '../conn/conn?deviceId=' + title + '&name=' + name,
      success: function (res) {
        // success
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    })
  },

  //搜索蓝牙设备
  scanBlueTooth: function () {
    var that = this;
    //1.打开蓝牙适配器
    wx.openBluetoothAdapter({

      success: function (res) {
        // success
        console.log("-----适配器打开成功-----");
        console.log(res);
        //2.开始搜索蓝牙设备：会费电，请注意关闭
        wx.startBluetoothDevicesDiscovery({
          services: [],
          success: function (res) {
            // success
            console.log("-----开始蓝牙设备搜索：----------");
            console.log(res);
          },
          fail: function (res) {
            // fail
            console.log(res);
          },
          complete: function (res) {
            // complete
            console.log(res);
          }
        });
      },
      fail: function (res) {
        console.log("-----蓝牙适配器打开失败-------");
        // fail
        console.log(res);
      },
      complete: function (res) {
        // complete
        console.log("-----适配器完成------");
        console.log(res);
      }
    });

    //获得搜索到的蓝牙设备列表
    wx.getBluetoothDevices({
      success: function (res) {
        // success
        //{devices: Array[11], errMsg: "getBluetoothDevices:ok"}
        console.log("读取搜索到的蓝牙设备列表");
        //如果蓝牙设备信息为0，则显示重新扫描按钮
        if (res.devices.length > 0) {
          //关闭蓝牙适配器
          wx.closeBluetoothAdapter({
            success: function (res) {
              console.log(res);
            },
          })
        };
        console.log(res);
        that.setData({
          list: res.devices
        });
        console.log(that.data.list);
      },
      fail: function (res) {
        // fail
      },
      complete: function (res) {
        // complete
      }
    });
  },
  reflash: function () {
    this.scanBlueTooth();
  }
})
