// utils/soap.js
const app = getApp();
const url = app.globalData.ewsUrl;
const username = wx.getStorageSync('cached_username');
const password = wx.getStorageSync('cached_password');

function base64Encode(str) {
  const charList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let encoded = '';

  for (let i = 0; i < str.length; i += 3) {
    const chunk = str.slice(i, i + 3);
    const chunkBinary = chunk
      .split('')
      .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
      .join('');

    for (let j = 0; j < 4; j++) {
      const index = j * 6;
      if (index <= chunkBinary.length) {
        const value = parseInt(chunkBinary.slice(index, index + 6), 2);
        encoded += charList.charAt(value);
      } else {
        encoded += '=';
      }
    }
  }
  return encoded;
}


async function sendSoapRequest(soapMessage) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'POST',
      data: soapMessage,
      header: {
        'Content-Type': 'text/xml; charset=utf-8',
        'Authorization': 'Basic ' + base64Encode(`${username}:${password}`),
      },
      success: (res) => {
        // console.log(res.data);
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(new Error('SOAP Request failed with status code: ' + res.statusCode));
        }
      },
      fail: (error) => {
        reject(error);
      },
    });
  });
}

module.exports = {
  sendSoapRequest,
};