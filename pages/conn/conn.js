const app = getApp();
const Toast = require('../../dist/zan-ui/toast/toast.js');

/**
 * 连接设备。获取数据
 */
Page({
  data: {
    motto: app.globalData.codeBody,
    deviceId: '',
    deviceName: '',
    name: '',
    serviceId: '',
    services: [],
    notycharacteristicsId: '',
    characteristicsId: '',
    result: '',
    isConn: false,
    showError: false,
    disabled: true,
  },
  onLoad: function (opt) {
    var that = this;
    console.log(`开始连接蓝牙:设备ID:${opt.deviceId},设备名称:${opt.name}`);
    //设置当前蓝牙的名称与ID
    that.setData({ deviceId: opt.deviceId, deviceName: opt.name });
    /**
     * 监听设备的连接状态
     * 该方法回调中可以用于处理连接意外断开等异常情况
     */
    wx.onBLEConnectionStateChanged(function (res) {
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)
    });
    //TODO 链接蓝牙设备
    setTimeout(function () {
      that.connectBLT();
    }, 2000);
  },

  //1.连接指定蓝牙设备
  connectBLT: function () {
    var that = this;
    /**
   * 连接设备
   */
    wx.createBLEConnection({
      deviceId: that.data.deviceId,
      success: function (res) {
        // success
        console.log("创建蓝牙低功耗连接成功", res);
        //关闭正在连接的动画
        that.setData({
          isConn: true,
          showError: false,
        });
        //获取服务的UUID
        var flag = that.getUUID();
      },
      fail: function (res) {
        console.log(res);
        // fail
        Toast({
          type: "fail",
          message: '蓝牙设备连接失败',
          selector: '#zan-toast-test'
        });
        that.setData({
          isConn: true,
          showError: true,
        });
        that.ifError();
      }
    });
  },
  //2.获取服务的UUID
  getUUID: function () {
    var that = this;
    wx.getBLEDeviceServices({
      deviceId: that.data.deviceId,
      success: function (res) {
        console.log('获取服务成功', res);
        //获取所有的服务UUID
        var allUUID = res.services;
        //蓝牙支持的服务数量
        var serviceLength = allUUID.length;
        for (var index = 0; index < serviceLength; index++) {
          var tempUUID = allUUID[index].uuid.slice(4, 8);
          //判断是否是我们需要的服务UUID
          if (tempUUID == 'FEE0' || tempUUID == 'fee0') {
            var indexUUID = index;
            that.setData({
              //确定需要的服务UUID
              serviceId: allUUID[indexUUID].uuid
            });
          }
        }
        console.log('需要连接的服务UUID:', that.data.serviceId);
        //获取特征值
        that.getCharacteristics();
      },
      fail: res => {
        console.log(res);
        Toast({
          type: "fail",
          message: '蓝牙服务获取失败',
          selector: '#zan-toast-test'
        });
        that.setData({
          isConn: true,
          showError: true,
        });
        that.ifError();
      }
    });
  },

  //3.获取特征值
  getCharacteristics: function () {
    console.log('开始获取特征值');
    var that = this;
    //设备特征值列表
    var deviceCharacteres = [];
    var characteristicsUUID = {};
    //开始获取设备特征值
    wx.getBLEDeviceCharacteristics({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      success: function (res) {
        console.log('获取到的特征值为：', res);
        //获取所有的特征值
        var characteristics = res.characteristics;
        //特征值数组的长度
        var characteristicsLength = characteristics.length;
        //遍历数组获取蓝牙使能UUID
        for (var i = 0; i < characteristicsLength; i++) {
          var notyCharacteristicsUUID = characteristics[i].uuid.slice(4, 8);
          if (notyCharacteristicsUUID == 'FEE1' || notyCharacteristicsUUID == 'fee1') {
            that.setData({
              characteristicsId: characteristics[i].uuid,
              notycharacteristicsId: characteristics[i].uuid,
            });
          }
        }
        //遍历数组获取蓝牙写入UUID
        for (var i = 0; i < characteristicsLength; i++) {
          var notyCharacteristicsUUID = characteristics[i].uuid.slice(4, 8);
          //如果是我们需要的写入ID
          if (notyCharacteristicsUUID == 'FEE2' || notyCharacteristicsUUID == 'fee2') {
            that.setData({
              characteristicsId: characteristics[i].uuid,
            });
          }
        }
        console.log(`获取蓝牙使能UUID成功,使能uuid:${that.data.notycharacteristicsId},写入UUID：${that.data.characteristicsId}`);
      }, fail: res => {
        console.log('获取特征值失败');
        that.ifError();
      }
    });
  },

  /**
   * 发送 数据到设备中
   */
  bindViewTap: function () {
    var that = this;
    var hex = 'AA5504B10000B5'
    var typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(
      function (h) {
        return parseInt(h, 16)
      }));
    console.log(typedArray)
    console.log([0xAA, 0x55, 0x04, 0xB1, 0x00, 0x00, 0xB5])
    var buffer1 = typedArray.buffer
    console.log(buffer1)
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.cd20,
      value: buffer1,
      success: function (res) {
        // success
        console.log("success  指令发送成功");
        console.log(res);
      },
      fail: function (res) {
        // fail
        console.log(res);
      },
      complete: function (res) {
        // complete
      }
    });
  },
  buf2hex: function (buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  },

  //出错操作，直接返回上一层
  ifError: res => {
    //如果连接失败，返回上级列表
    setTimeout(function () {
      wx.navigateBack({

      })
    }, 3000);
  }


})