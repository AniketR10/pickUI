console.log('pickUI is listening');

chrome.runtime.onMessage.addListener((message, _sender, sendRes) => {
    if(message.action === "GET_STYLES") {
        sendRes({status: "recieved"});
    }
})