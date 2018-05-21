const app = getApp();
const Toast = require('../../dist/zan-ui/toast/toast.js');
const utils = require('../../utils/util.js')
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
    recvValue: '',
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
        //使能事件
        that.notycharacteristicsId();
      }, fail: res => {
        console.log('获取特征值失败');
        that.ifError();
      }
    });
  },

  //4.操作使能事件
  notycharacteristicsId: function () {
    var that = this;
    var recvValueAscii = "";
    var stringValue = "";
    var recveValue = "";

    wx.notifyBLECharacteristicValueChange({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.notycharacteristicsId,
      state: true,
      success: function (res) {
        console.log('调用蓝牙使能成功:', res);
        //解除按钮置灰
        that.setData({
          disabled: false
        });
        wx.onBLECharacteristicValueChange(function (res) {
          var lengthHex = [];
          var turnBack = "";
          var result = res.value;
          console.log(result);
          var hex = utils.buf2hex(result);
          console.log('设备返回来的值', hex);
          var fHex = hex;
          var lengthSoy = fHex.length / 2;
          var length = Math.round(lengthSoy);
          for (var i = 0; i < length; i++) {
            var hexSpalit = fHex.slice(0, 2);
            lengthHex.push(hexSpalit);
            fHex = fHex.substring(2);
          }
          console.log('length hex', lengthHex);
          for (var j = 0; j < lengthHex.length; j++) {
            var integar = lengthHex[j];    //十六进制
            recveValue = parseInt(integar, 16);    //十进制
            console.log('recveValue', recveValue);
            turnBack = turnBack + String.fromCharCode(recveValue);
            console.log('turnBack', turnBack);
          }
          console.log('最终转回来的值', turnBack)
          that.setData({
            result: that.data.result + turnBack
          });
        });
      },
      fail: res => {
        console.log('调用蓝牙使能失败');
        that.ifError();
      }
    });
  },
  /**
   * 发送 数据到设备中
   */
  bindViewTap: function () {
    var that = this;
    var writeArray = [];
    var charCodeAt = [];
    var valueAscii = "";
    var recvValueAscii = "";
    var stringValue = "";
    var recveValue = "";
    var valueInitialOne = app.globalData.codeBody;       //拿到输入框的值
    console.log('输入框中的值', valueInitialOne);
    /* 判断是否存在空格 */
    if (valueInitialOne.indexOf(' ') > 0) {
      var valueInitial = that.splitStr(valueInitialOne, ' ');    //存在空格时
      console.log('删除掉空格', valueInitial);
    } else {
      var valueInitial = valueInitialOne;    //不存在空格时
    }
    /* 判断字节是否超过20字节 */
    if (valueInitial.length > 20) {     //当字节超过20的时候，采用分段发送
      //选择Ascii码发送
      var value_split = valueInitial.split('');  //将字符一个一个分开
      console.log('value_split', value_split);
      for (var i = 0; i < value_split.length; i++) {
        valueAscii = valueAscii + value_split[i].charCodeAt().toString(16);     //转为Ascii字符后连接起
      }
      var recveValue = valueAscii;
      console.log('转为Ascii码值', recveValue);
      console.log('recveValue的长度', recveValue.length)
      var Ascii_send_time = Math.ceil(recveValue.length / 20);
      console.log('Ascii发送的次数', Ascii_send_time);
      for (var i = 0; i < Ascii_send_time; i++) {
        if (recveValue.length > 20) {
          var value = recveValue.slice(0, 20);
          console.log('截取到的值', value);
          recveValue = recveValue.substring(20);
          console.log('此时剩下的recveValue', recveValue);
          writeArray.push(value);        //放在数组里面
        } else {
          var value = recveValue;
          writeArray.push(recveValue);        //放在数组里面
        }
      }
      console.log('数组writeArray', writeArray);
      writeArray.map(function (val, index) {
        setTimeout(function () {
          var value_set = val;
          console.log('value_set', value_set);
          var write_function = that.write(value_set);       //调用数据发送函数
        }, index * 100)
      });
    } else {
      //当字节不超过20的时候，直接发送
      /* 当选择以Ascii字符发送的时候 */
      var value_split = valueInitial.split('');  //将字符一个一个分开
      console.log('value_split', value_split);
      for (var i = 0; i < value_split.length; i++) {
        valueAscii = valueAscii + value_split[i].charCodeAt().toString(16);     //转为Ascii字符后连接起
      }
      var value = valueAscii;
      console.log('转为Ascii码值', value);
      var write_function = that.write(value);     //调用数据发送函数
      /* 成功发送的值的字节 */
      if (that.data.send_string == true) {
        var send_number_1 = that.data.send_number + valueInitial.length / 2;
        var send_number = Math.floor(send_number_1);
        that.setData({
          send_number: send_number
        });
      } else {
        var send_number_1 = that.data.send_number + valueInitial.length;
        var send_number = Math.round(send_number_1);
        that.setData({
          send_number: send_number
        })
      }
    }
  },
  write: function (str) {
    var that = this;
    var value = str;
    console.log('value', value);
    /* 将数值转为ArrayBuffer类型数据 */
    var typedArray = new Uint8Array(value.match(/[\da-f]{2}/gi).map(function (h) {
      return parseInt(h, 16)
    }));
    var buffer = typedArray.buffer;
    wx.writeBLECharacteristicValue({
      deviceId: that.data.deviceId,
      serviceId: that.data.serviceId,
      characteristicId: that.data.characteristicsId,
      value: buffer,
      success: function (res) {
        console.log('数据发送成功', res);
      },
      fail: function (res) {
        console.log('调用失败', res);
        /* 调用失败时，再次调用 */
        wx.writeBLECharacteristicValue({
          deviceId: that.data.deviceId,
          serviceId: that.data.serviceId,
          characteristicId: that.data.characteristicsId,
          value: buffer,
          success: function (res) {
            console.log('第2次数据发送成功', res);
          },
          fail: function (res) {
            console.log('第2次调用失败', res);
            /* 调用失败时，再次调用 */
            wx.writeBLECharacteristicValue({
              deviceId: that.data.deviceId,
              serviceId: that.data.serviceId,
              characteristicId: that.data.characteristicsId,
              value: buffer,
              success: function (res) {
                console.log('第3次数据发送成功', res);
              },
              fail: function (res) {
                console.log('第3次调用失败', res);
              }
            });
          }
        });
      }
    });
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