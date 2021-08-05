// listen for checkForWord request, call getTags which includes callback to sendResponse
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "checkForAddresses") {
            checkForAddresses(request, sender, sendResponse);
            // this is required to use sendResponse asynchronously
            return true;
        }
    }
);

//Returns the index of the first instance of the desired word on the page.
function checkForAddresses(request, sender, sendResponse){
    var search_in = document.body.innerHTML;
    string_context = search_in.toString();
    array_addresses = string_context.match(/0x[a-fA-F0-9]{40}/g);
    //array_addresses.push("test123");
    //console.log(array_addresses);
    sendResponse (array_addresses.filter(onlyUnique));
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  
  // usage example:
  //var a = ['a', 1, 'a', 2, '1'];
  //var unique = a.filter(onlyUnique);
  
  //console.log(unique); // ['a', 1, 2, '1']