// utils/ews.js
const app = getApp()
const {
  DOMParser
} = require('xmldom');

const soap = require('./soap');

async function login(username) {
  // 构造登录请求的 SOAP 消息体
  const loginSoapMessage = `
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                 xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
    <soap:Header>
      <t:RequestServerVersion Version="Exchange2013_SP1" />
    </soap:Header>
    <soap:Body>
      <ResolveNames xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
                    xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
                    <UnresolvedEntry>${username}</UnresolvedEntry>
      </ResolveNames>
    </soap:Body>
  </soap:Envelope>
`;
  const res = await soap.sendSoapRequest(loginSoapMessage);
  const doc = new DOMParser().parseFromString(res, 'text/xml');
  const status = doc.documentElement.getElementsByTagName('m:ResponseCode')[0].textContent;
  return status
}

async function fetchItemIds() {
  const soapMessage = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
  <soap:Header>
    <t:RequestServerVersion Version="Exchange2013_SP1" />
  </soap:Header>
  <soap:Body>
    <FindItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
              xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types"
              Traversal="Shallow">
      <ItemShape>
        <t:BaseShape>Default</t:BaseShape>
        <t:AdditionalProperties>
          <t:FieldURI FieldURI="item:Body" />
        </t:AdditionalProperties>
      </ItemShape>
      <IndexedPageItemView MaxEntriesReturned="300" Offset="0" BasePoint="Beginning" />
      <ParentFolderIds>
        <t:DistinguishedFolderId Id="notes" />
      </ParentFolderIds>
    </FindItem>
  </soap:Body>
</soap:Envelope>
`;

  const res = await soap.sendSoapRequest(soapMessage);
  const doc = new DOMParser().parseFromString(res, 'text/xml');
  const itemElements = doc.documentElement.getElementsByTagName('t:Message');
  const itemIds = [];
  for (let i = 0; i < itemElements.length; i++) {
    const itemElement = itemElements[i];
    const itemIdElements = itemElement.getElementsByTagName('t:ItemId');
    if (itemIdElements.length > 0) {
      const itemId = itemIdElements[0].getAttribute('Id');
      itemIds.push(itemId);
    };
  };
  return itemIds;
}

function getRandomItemIds(itemIds, count) {
  const randomItemIds = [];
  while (randomItemIds.length < count && itemIds.length > 0) {
    const randomIndex = Math.floor(Math.random() * itemIds.length);
    randomItemIds.push(itemIds[randomIndex]);
    itemIds.splice(randomIndex, 1);
  }
  return randomItemIds;
}

async function fetchItemContents(itemIds) {
  const itemContents = [];
  for (const itemId of itemIds) { // 使用 for...of 循环
    const getItemDetailsSoapMessage = `
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
                       xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
          <soap:Header>
            <t:RequestServerVersion Version="Exchange2013_SP1" />
          </soap:Header>
          <soap:Body>
            <GetItem xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
                     xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
              <ItemShape>
                <t:BaseShape>Default</t:BaseShape>
              </ItemShape>
              <ItemIds>
                <t:ItemId Id="${itemId}" />
              </ItemIds>
            </GetItem>
          </soap:Body>
        </soap:Envelope>`;
    const res = await soap.sendSoapRequest(getItemDetailsSoapMessage);

    const noteDetails = new DOMParser().parseFromString(res, 'text/xml');
    let dateTime = new Date(noteDetails.getElementsByTagName('t:DateTimeCreated')[0].textContent);
    let year = dateTime.getFullYear();
    let month = dateTime.getMonth() + 1;
    let day = dateTime.getDate();
    let hours = dateTime.getHours();
    let minutes = dateTime.getMinutes();
    const formattedDate = `${year}年${month < 10 ? '0' : ''}${month}月${day < 10 ? '0' : ''}${day}日 ${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
    let htmlData = noteDetails.getElementsByTagName('t:Body')[0].textContent;
    const doc = new DOMParser().parseFromString(htmlData, 'text/html');
    const pNodes = doc.getElementsByTagName('p');
    let noteBody = '';
    for (let i = 0; i < pNodes.length; i++) {
      const pNode = pNodes[i];
      noteBody = noteBody + pNode.textContent.trim() + '\n';
    }
    const noteObj = {
      id: noteDetails.getElementsByTagName('t:ItemId')[0].getAttribute('Id'),
      body: noteBody,
      dateTime: formattedDate
    };
    itemContents.push(noteObj);
  }
  return itemContents;
}

async function fetchData() {
  try {
    let itemIds = await fetchItemIds();
    app.globalData.notesCount = itemIds.length;
    let randomItemIds = getRandomItemIds(itemIds, 15);

    // 使用 Promise.all 来等待所有的 fetchItemContents 操作完成
    let itemContentsPromises = randomItemIds.map(itemId => {
      return fetchItemContents([itemId]); // 传递每个不同的 itemId
    });
    let itemContents = await Promise.all(itemContentsPromises);

    // 将每个 JSON 对象的列表合并成一个大的列表
    let mergedItemContents = [].concat(...itemContents);
    return mergedItemContents;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  login,
  fetchData,
  fetchItemIds,
  getRandomItemIds,
  fetchItemContents,
};