// soapLib.js

const noteListSoapMessage = `
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
      <IndexedPageItemView MaxEntriesReturned="2000" Offset="0" BasePoint="Beginning" />
      <ParentFolderIds>
        <t:DistinguishedFolderId Id="notes" />
      </ParentFolderIds>
    </FindItem>
  </soap:Body>
</soap:Envelope>
`;

const getImageSoapMessage = (fileId) => `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
<soap:Header>
<t:RequestServerVersion Version="Exchange2013_SP1" />
</soap:Header>
<soap:Body>
<GetAttachment xmlns="http://schemas.microsoft.com/exchange/services/2006/messages"
      xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types">
<AttachmentShape>
<t:IncludeMimeContent>true</t:IncludeMimeContent>
</AttachmentShape>
<AttachmentIds>
<t:AttachmentId Id="${fileId}" />
</AttachmentIds>
</GetAttachment>
</soap:Body>
</soap:Envelope>`

const loginSoapMessage = (username) => `
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

const getItemDetailsSoapMessage = (itemId) => `
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

module.exports = {
  getImageSoapMessage,
  loginSoapMessage,
  noteListSoapMessage,
  getItemDetailsSoapMessage,
};