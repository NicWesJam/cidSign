// content.js
// alert("Hello from your Chrome extension!")

function getCryptoAddresses() {

    var search_in = document.body.innerHTML;
    string_context = search_in.toString();
    
    array_addresses = string_context.match(/0x[a-fA-F0-9]{40}/g);
    return array_addresses;
    
    }

function getEmails() {

    var search_in = document.body.innerHTML;
    string_context = search_in.toString();
    
    array_mails = string_context.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
    return array_mails;
    
    }

console.log('starting search')
console.log(getEmails())
console.log(getCryptoAddresses())

fetch('http://127.0.0.1:8000/domain/thinkingzoo.com/')
  .then(response => response.json())
  .then(data => console.log(data));