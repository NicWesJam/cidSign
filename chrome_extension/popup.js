API_URL = 'http://127.0.0.1:8000/linked_address/'

document.addEventListener("DOMContentLoaded", function(event) {
    //var resultsButton = document.getElementById("getResults");
    //resultsButton.onclick = getResults();
    getResults();
    //resultsButton.onclick = window.location.reload();
});

window.onload=function(){

    // If refresh button is clicked then refresh results
    document.getElementById("getResults").addEventListener("click", function() {
        getResults();
    });

    // If selected blockchain type changes then refresh results
    document.getElementById("blockchain").addEventListener("change", function() {
        getResults();
    });
  }


function getResults(){
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        
        chrome.tabs.sendMessage(tabs[0].id, { action: "checkForAddresses" }, function (response) {
            if (response == null){
                document.getElementById("results").innerText = "No blockchain addreses identified";
                document.getElementById("placeholderTable").innerHTML = "";
            } else {
                let blockchainSelect = document.getElementById("blockchain")
                let blockchainValue = blockchainSelect.options[blockchainSelect.selectedIndex].value;
                //let blockchainValue = blockchainSelect.selectedIndex;

                checkResults(response, blockchainValue);
            }
            
        });
    });
}

function showResults(results) {
    var resultsElement = document.getElementById("results");
    resultsElement.innerText = results;
}

async function checkResults(results, address_type) {
    document.getElementById("results").innerText = address_type;
    
    let resultsArray = [];
    for (let i = 0; i < results.length; i++) {
        url = API_URL + address_type+"_"+results[i]+"/";
        await fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data['detail'] == undefined) {
                    // We have good data
                    resultsArray.push({address: results[i], match: data['linked_domain']})
                } else {
                    // It is undefined
                    resultsArray.push({address: results[i], match:'no match'})
                }
                //resultsElement.innerText=JSON.stringify(data['detail']);
            })
        }
    //resultsArray.push('test');
    //resultsElement.innerText = JSON.stringify(resultsArray);
    buildTable(resultsArray);

                
    //resultsElement.innerText = results;
    
}

function buildTable(data){
    table = document.createElement("table");
    table.id = 'placeholderTable';
    for (var i = 0; i < data.length; i++) {
        let row = table.insertRow();
        let cell1 = row.insertCell();
        cell1.innerHTML = data[i]['address'];
        let cell2 = row.insertCell();
        cell2.innerHTML = data[i]['match'];
    }
    //document.getElementById("results").innerText = "";
    document.getElementById("placeholderTable").replaceWith(table);
}


/*
fetch('http://127.0.0.1:8000/domain/thinkingzoo.com/')
  .then(response => response.json())
  .then(data => console.log(data));

*/