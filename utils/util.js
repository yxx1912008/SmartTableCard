const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/* ArrayBuffer类型数据转为16进制字符串 */
const buf2hex = buffer => { // buffer is an ArrayBuffer
  console.log('接收的数据为', buffer);
  return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

module.exports = {
  formatTime: formatTime,
  buf2hex: buf2hex
}
