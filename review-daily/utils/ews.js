// utils/ews.js

const {
  DOMParser
} = require('xmldom');

const soap = require('./soap');
const soapMessage = require('./soapLib');

async function login(username, password) {
  // 构造登录请求的 SOAP 消息体
  const loginSoapMessage = soapMessage.loginSoapMessage(usrname);
  const res = await soap.sendSoapRequest(loginSoapMessage, username = username, password = password);
  const doc = new DOMParser().parseFromString(res, 'text/xml');
  const status = doc.documentElement.getElementsByTagName('m:ResponseCode')[0].textContent;
  return status
}

async function fetchItemIds() {
  //  获取所有笔记ID
  const noteListSoapMessage = soapMessage.noteListSoapMessage;
  const res = await soap.sendSoapRequest(noteListSoapMessage);
  const doc = new DOMParser().parseFromString(res, 'text/xml');
  const notesBaseInfoNode = doc.documentElement.getElementsByTagName('t:Message');
  const notesBaseInfo = extractTag(notesBaseInfoNode);
  console.log(notesBaseInfo)
  return notesBaseInfo;
}

async function fetchItemContents(itemIds) {
  // 获取所有卡片内容
  return await Promise.all(itemIds.map(fetchItemContent));
}

async function fetchItemContent(itemId) {
  // 处理单张卡片数据
  const getItemDetailsSoapMessage = soapMessage.getItemDetailsSoapMessage(itemId);
  const res = await soap.sendSoapRequest(getItemDetailsSoapMessage);

  const noteDetails = new DOMParser().parseFromString(res, 'text/xml');

  const noteId = extractNoteId(noteDetails);
  const formattedDate = extractDateTime(noteDetails);
  const noteBody = extractNoteBody(noteDetails);
  const imagesInfo = extractImageInfo(noteDetails);

  return {
    id: noteId,
    body: noteBody,
    dateTime: formattedDate,
    images: imagesInfo,
  };
}

async function fetchImage(imageInfo) {
  const tempFilePath = wx.env.USER_DATA_PATH + '/' + imageInfo.fileName;

  try {
    // 检查文件是否存在
    await new Promise((resolve, reject) => {
      wx.getFileSystemManager().access({
        path: tempFilePath,
        success: () => {
          console.log(tempFilePath, 'file already exists!');
          resolve();
        },
        fail: reject,
      });
    });
    return tempFilePath;
  } catch (error) {
    // 文件不存在，请求该文件信息
    try {
      const getImageSoapMessage = soapMessage.getImageSoapMessage(imageInfo.fileId);
      const res = await soap.sendSoapRequest(getImageSoapMessage);
      const ImageDetails = new DOMParser().parseFromString(res, 'text/xml');
      const attachmentsNode = ImageDetails.getElementsByTagName('m:Attachments')[0];
      const fileAttachmentNode = attachmentsNode.getElementsByTagName('t:FileAttachment')[0];
      const contentNode = fileAttachmentNode.getElementsByTagName('t:Content')[0];
      const imgString = contentNode.textContent;

      // 获取base64图片信息后保存
      await new Promise((resolve, reject) => {
        wx.getFileSystemManager().writeFile({
          filePath: tempFilePath,
          data: imgString,
          encoding: 'base64',
          success: () => {
            console.log(tempFilePath, 'file saved successfully!');
            resolve();
          },
          fail: reject,
        });
      });
      return tempFilePath;
    } catch (error) {
      handleError(error);
    }
  }
}

async function fetchData() {
  try {
    const itemIds = await fetchItemIds();
    wx.setStorageSync('notesCount', itemIds.length);
    const updatedTags = processTags(itemIds);
    wx.setStorageSync('tags', updatedTags);
    const randomItemIds = selectRandomItemIds(itemIds).filter(Boolean);
    const itemContents = await fetchItemContents(randomItemIds);
    wx.setStorageSync('cards', itemContents.flat());

    if (typeof callback === 'function') {
      callback();
    }
    return itemContents.flat();
  } catch (error) {
    handleError(error);
  }
}

function extractNoteId(noteDetails) {
  return noteDetails.getElementsByTagName('t:ItemId')[0].getAttribute('Id')
}

function extractTag(notesBaseInfoNode) {
  return Array.from(notesBaseInfoNode).map(noteItem => {
    const itemId = extractNoteId(noteItem);
    const subjectElements = noteItem.getElementsByTagName('t:Subject');
    if (itemId && itemId.length > 0) {
      // 使用正则处理标签
      const tag_regex = /^\s*#(.+?)\s/gm;
      const result = tag_regex.exec(subjectElements[0].textContent);
      const tag = result ? result[1].trim() : '';
      return {
        itemId: itemId,
        tag: tag
      };
    }
  }).filter(Boolean);
}

function extractDateTime(noteDetails) {
  const dateTimeString = noteDetails.getElementsByTagName('t:DateTimeCreated')[0].textContent
  const dateTime = new Date(dateTimeString);
  const year = dateTime.getFullYear();
  const month = dateTime.getMonth() + 1;
  const day = dateTime.getDate();
  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes();
  return `${year}年${month < 10 ? '0' : ''}${month}月${day < 10 ? '0' : ''}${day}日 ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

function extractNoteBody(noteDetails) {
  // 返回数据中有html格式的转义符和组件，小程序不兼容，需要进行二次解析
  let htmlData = noteDetails.getElementsByTagName('t:Body')[0].textContent;
  const bodyNodes = new DOMParser().parseFromString(htmlData, 'text/html');
  const pNodes = bodyNodes.getElementsByTagName('p');
  let noteText = '';
  for (let i = 0; i < pNodes.length; i++) {
    const pNode = pNodes[i];
    noteText = noteText + pNode.textContent.trim() + '\n';
  }
  return noteText;
}

function extractImageInfo(noteDetails) {
  const attachmentsNode = noteDetails.getElementsByTagName('t:Attachments')[0];
  // 如果没有附件则不请求
  if (!attachmentsNode) return [];

  const fileNodes = attachmentsNode ? Array.from(attachmentsNode.getElementsByTagName('t:FileAttachment')) : [];
  const fileInfoList = fileNodes.map((fileNode) => {
    const fileId = fileNode.getElementsByTagName('t:AttachmentId')[0].getAttribute('Id');
    const fileName = fileNode.getElementsByTagName('t:Name')[0].textContent;
    return {
      fileId: fileId,
      fileName: fileName,
    };
  });
  // 下载图片附件
  Promise.all(fileInfoList.map(fetchImage));
  return fileInfoList;
}

function processTags(itemIds) {
  const tagCounts = itemIds.reduce((acc, curr) => {
    acc[curr.tag] = (acc[curr.tag] || 0) + 1;
    return acc;
  }, {});
  return updateTags(tagCounts);
}

function updateTags(tagCounts) {
  const tags = Object.keys(tagCounts).map(tag => ({
    name: tag,
    count: tagCounts[tag],
    selected: true
  }));
  const cachedTags = wx.getStorageSync('tags') || [];
  return mergeTags(tags, cachedTags);
}

function mergeTags(tags, cachedTags) {
  // 将新老标签进行合并
  return tags.map(tag => {
    const cachedTag = cachedTags.find(cached => tag.name === cached.name);
    return cachedTag ? cachedTag : tag;
  });
}

function getRandomItemIds(matchedItems, scales) {
  // 随机筛选数据
  const randomItemIds = [];
  while (randomItemIds.length < scales || (randomItemIds.length <= matchedItems.length && matchedItems.length < scales)) {
    const randomIndex = Math.floor(Math.random() * matchedItems.length);
    randomItemIds.push(matchedItems[randomIndex]);
    matchedItems.splice(randomIndex, 1);
  }
  return randomItemIds;
}

function selectRandomItemIds(itemIds) {
  // 筛选指定标签下的笔记id
  const scales = wx.getStorageSync('scales') || 15;
  const selectedTags = getSelectedTags();
  const matchedItems = itemIds.filter(itemId =>
    selectedTags.some(selected => selected.name === itemId.tag)
  ).map(matched => matched.itemId);
  return getRandomItemIds(matchedItems, scales).filter(Boolean);
}

function getSelectedTags() {
  // 筛选需要的标签
  const tags = wx.getStorageSync('tags') || [];
  return tags.filter(tag => tag.selected);
}

function handleError(error) {
  console.error('Fetching data failed:', error);
  if (typeof callback === 'function') {
    callback();
  }
  throw error;
}

module.exports = {
  login,
  fetchData,
  fetchItemIds,
  fetchImage,
  getRandomItemIds,
  fetchItemContents,
};