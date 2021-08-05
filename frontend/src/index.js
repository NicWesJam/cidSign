/******************************************************************************
************************************ cidSign* *********************************
*******************************************************************************

Description - Very fun code to run a basic way to sign CIDs on the Ethereum
blockchain and check that Ethereum address against a API that checks DNS data
to see if any domain has claimed an Ethereum address, note this is not yet
authenticated and is currently in prototype mode.

There are 5 main components in this file
1) Imports
2) API Keys (setup your own)
3) The Application Binary Interface, yeah this is ugly
4) The addressDNS object
5) cidSign.initialize() to launch cidSign

//************************ IMPORTS ************************/

import { Web3Storage } from 'web3.storage'
import '@/styles/index.scss'
import filecoinLogo from '@/images/filecoin-logo.png'
import ipfsLogo from '@/images/IPFS-logo.png'
import web3StorageLogo from '@/images/web3storage-logo-orange.png'
const CID = require('cids')

//************************ API STUFF ***********************

const INFURA_API_KEY = 'your-key'
const WEB_3_STORAGE_TOKEN = 'your token'
// assuming you are also running the api locally
const ADDRESS_DNS_API_URL = 'http://127.0.0.1:8000/linked_address/'
// this contract address only works on rinkeby test network
const CONTRACT_ADDRESS = '0x5cdf06FE5dd2553eA3ebFc7baa7795a7913dDFf5'

//************************ APPLICATION BINARY INTERFACE ***********************
// This is pretty ugly to keep in this file
const abiJSON = [
  {
    inputs: [
      {
        internalType: 'string',
        name: '_cid',
        type: 'string',
      },
    ],
    name: 'getSigners',
    outputs: [
      {
        internalType: 'address[]',
        name: '',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: '',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: '_cid',
        type: 'string',
      },
    ],
    name: 'signCID',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

/**************************** addressDNS Main Object *************************/

var cidSign = {
  // Constant variables
  /**************************** Constant Variables *************************/

  networkNameTranslate: {
    0x1: 'Ethereum Main Network (Mainnet)',
    0x3: 'Ropsten Test Network',
    0x4: 'Rinkeby Test Network',
    0x5: 'Goerli Test Network',
    0x2a: 'Kovan Test Network',
  },

  /**************************** Global State & Objects *************************/

  state: {
    metamask: false, // Boolean, does user have metamask installed
    testsPassed: 0, // number of passed tests for initialization
    account: null, // Eth Account MetaMask is using
    network: null, // What network MetaMask is on
    cid: undefined, // Content identifier
    web3Storage: undefined, // setup web3Storage
    signatures: {
      signers: undefined, // Array of addresses that have signed
      signTimes: undefined, // Array of datetime when the signature occured
    }, // array of signatures
    signaturesLength: 0, // length of signatures
    ethSignContract: undefined, // Holds the web3 contract
    transaction: {
      status: 'available',
      confirmationBlocks: 0,
      transactionHash: undefined,
      etherscanAddress: undefined, // Etherscan address
    },
  },

  // Relevant html objects that are changed or listened to
  htmlObjects: {
    fileInput: document.getElementById('fileInput'),
    leftDiv: document.getElementById('leftDiv'),
    rightDiv: document.getElementById('rightDiv'),
    cid: document.getElementById('cid'),
    signaturesTable: document.getElementById('signaturesTable'),
    numSignatures: document.getElementById('numSignatures'),
    showNetwork: document.getElementById('showNetwork'),
    showAccount: document.getElementById('showAccount'),
    signCidButton: document.getElementById('signCidButton'),
    transactionStatus: document.getElementById('transactionStatus'),
    numConfirmationBlocks: document.getElementById('numConfirmationBlocks'),
    etherscanAddress: document.getElementById('etherscanAddress'),
    initializationDiv: document.getElementById('initializationDiv'),
    opaqueDiv: document.getElementById('opaque'),
    htmlComponentTest: document.getElementById('htmlComponentTest'),
    web3LoadedTest: document.getElementById('web3LoadedTest'),
    providerInitializedTest: document.getElementById('providerInitializedTest'),
    getAccountTest: document.getElementById('getAccountTest'),
    smartContractTest: document.getElementById('smartContractTest'),
    htmlListenerTest: document.getElementById('htmlListenerTest'),
    ethListenerTest: document.getElementById('ethListenerTest'),
    initialDisplayTest: document.getElementById('initialDisplayTest'),
    continueButton: document.getElementById('continueButton'),
    refreshSignaturesButton: document.getElementById('refreshSignaturesButton'),
    web3StorageInitializedTest: document.getElementById(
      'web3StorageInitializedTest'
    ),
    refreshCidStatusButton: document.getElementById('refreshCidStatusButton'),
    cidStatus: document.getElementById('cidStatus'),
  },

  /**************************** Initialization Section *************************/

  initialize: function () {
    // Chain time
    // Run through each initialization function
    // Increment a counter if successful
    // Adjust text on what happens
    // Check if the counter == required # of tests
    // Give option to continue or raise issues to user
    // Limit user to Rinkeby testnet for now

    // This doesn't work if one of the spans that represent test state are
    // messed up. What evs something to fix at some point

    this.setupHTMLObjects().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.htmlComponentTest.innerHTML = 'successful'
        this.htmlObjects.htmlComponentTest.style.color = 'green'
      }.bind(this),
      function () {
        this.htmlObjects.htmlComponentTest.innerHTML = 'failed'
        this.htmlObjects.htmlComponentTest.style.color = 'red'
      }.bind(this)
    )

    this.checkWeb3Loaded().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.web3LoadedTest.innerHTML = 'successful'
        this.htmlObjects.web3LoadedTest.style.color = 'green'
      }.bind(this),
      function (response) {
        this.htmlObjects.web3LoadedTest.innerHTML = 'failed'
        this.htmlObjects.web3LoadedTest.style.color = 'red'
      }.bind(this)
    )

    this.loadProvider().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.providerInitializedTest.innerHTML = 'successful'
        this.htmlObjects.providerInitializedTest.style.color = 'green'
      }.bind(this),
      function () {
        this.htmlObjects.providerInitializedTest.innerHTML = 'failed'
        this.htmlObjects.providerInitializedTest.style.color = 'red'
      }.bind(this)
    )

    this.setupWeb3Storage().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.web3StorageInitializedTest.innerHTML = 'successful'
        this.htmlObjects.web3StorageInitializedTest.style.color = 'green'
      }.bind(this),
      function () {
        this.htmlObjects.web3StorageInitializedTest.innerHTML = 'failed'
        this.htmlObjects.web3StorageInitializedTest.style.color = 'red'
      }.bind(this)
    )

    if (this.state.metamask) {
      this.getAccountData().then(
        function () {
          // resolve getAccountData OR if we didn't run it as there was no metamask
          this.state.testsPassed += 1
          this.htmlObjects.getAccountTest.innerHTML = 'successful'
          this.htmlObjects.getAccountTest.style.color = 'green'
        }.bind(this),
        function (error) {
          this.htmlObjects.getAccountTest.innerHTML = 'failed-' + error
          this.htmlObjects.getAccountTest.style.color = 'red'
        }.bind(this)
      )
    }

    this.setupSmartContract().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.smartContractTest.innerHTML = 'successful'
        this.htmlObjects.smartContractTest.style.color = 'green'
      }.bind(this),
      function (response) {
        console.log(response)
        this.htmlObjects.smartContractTest.innerHTML = 'failed'
        this.htmlObjects.smartContractTest.style.color = 'red'
      }.bind(this)
    )

    this.setupEventListeners().then(
      function () {
        this.state.testsPassed += 1
        this.htmlObjects.htmlListenerTest.innerHTML = 'successful'
        this.htmlObjects.htmlListenerTest.style.color = 'green'
      }.bind(this),
      function () {
        this.htmlObjects.htmlListenerTest.innerHTML = 'failed'
        this.htmlObjects.htmlListenerTest.style.color = 'red'
      }.bind(this)
    )

    // Check if a valid parameter was loaded, if so get signatures
    if (this.state.cid != undefined) {
      this.getSignatures()
    }
    if (window.ethereum != undefined) {
      this.setupEthListeners().then(
        function () {
          this.state.testsPassed += 1
          this.htmlObjects.ethListenerTest.innerHTML = 'successful'
          this.htmlObjects.ethListenerTest.style.color = 'green'
        }.bind(this),
        function () {
          this.htmlObjects.ethListenerTest.innerHTML = 'failed'
          this.htmlObjects.ethListenerTest.style.color = 'red'
        }.bind(this)
      )
    } else {
      this.state.testsPassed += 1
      this.htmlObjects.ethListenerTest.innerHTML = 'Not required'
      this.htmlObjects.ethListenerTest.style.color = 'orange'
    }

    try {
      this.displayVars()
      this.state.testsPassed += 1
      this.htmlObjects.initialDisplayTest.innerHTML = 'successful'
      this.htmlObjects.initialDisplayTest.style.color = 'green'
    } catch (error) {
      this.htmlObjects.initialDisplayTest.innerHTML = 'failed'
      this.htmlObjects.initialDisplayTest.style.color = 'red'
    }
  },

  setupHTMLObjects: function () {
    return new Promise(
      function (resolve, reject) {
        for (const htmlObject in this.htmlObjects) {
          if (this.htmlObjects[htmlObject] == null) {
            reject('html component is null')
          }
        }

        // Setup images for top L corner
        const app = document.querySelector('#topcorner')

        const logo1 = document.createElement('img')
        logo1.src = filecoinLogo
        logo1.style.height = '100px'

        const logo2 = document.createElement('img')
        logo2.src = ipfsLogo
        logo2.style.height = '100px'

        const logo3 = document.createElement('img')
        logo3.src = web3StorageLogo
        logo3.style.height = '100px'

        document.getElementById('logo1').appendChild(logo1)
        document.getElementById('logo2').appendChild(logo2)
        document.getElementById('logo3').appendChild(logo3)
        resolve()
      }.bind(this)
    )
  },

  checkWeb3Loaded: function () {
    return new Promise(
      function (resolve, reject) {
        try {
          if (Web3) {
            resolve()
          } else {
            reject('Web3 not loaded')
          }
        } catch (e) {
          reject(e)
        }
      }.bind(this)
    )
  },

  setupSmartContract: function () {
    // Setup smart contract
    // There should probably be some sort of testing here
    return new Promise(
      function (resolve, reject) {
        // setup contract'
        try {
          this.state.ethSignContract = new web3.eth.Contract(
            abiJSON,
            CONTRACT_ADDRESS
          )
        } catch (response) {
          reject(response)
        }
        resolve()
      }.bind(this)
    )
  },

  loadProvider: function () {
    return new Promise(
      function (resolve, reject) {
        // Check if Web3 provider is injected
        try {
          if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            this.state.metamask = true
            // Pull initial account data
          } else {
            this.state.metamask = false // Just double check it is false
            web3 = new Web3(
              new Web3.providers.HttpProvider(
                'https://rinkeby.infura.io/v3/' + INFURA_API_KEY
              )
            )
            this.state.network = 4 // set network to rinkeby
          }
          resolve()
        } catch (error) {
          console.log('Error setting up Web3 Provider')
          console.log(error)
          reject(error)
        }
      }.bind(this)
    )
  },

  getAccountData: function () {
    return new Promise(
      async function (resolve, reject) {
        // Query to get accounts and network
        // Update state with results
        try {
          this.state.account = await ethereum.request({
            method: 'eth_requestAccounts',
          })
        } catch {
          console.log('Error process eth_requestAccounts')
          this.state.account = 'error'
          reject('Error process eth_requestAccounts')
        }

        try {
          this.state.network = await ethereum.request({
            method: 'eth_chainId',
          })
          if (this.state.network != '0x4') {
            reject('wrong network, currently only rinkeby works')
          }
        } catch {
          console.log('Error process eth_chainId')
          this.state.network = 'error'
          reject('Error process eth_chainId')
        }
        resolve()
      }.bind(this)
    )
  },

  // Setup Ethereum listeners to reload the page if any account data changes
  setupEthListeners: function () {
    return new Promise(function (resolve, reject) {
      try {
        ethereum.on('chainChanged', (chainId) => {
          window.location.reload()
        })
        ethereum.on('accountsChanged', (chainId) => {
          window.location.reload()
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  },

  setupWeb3Storage: function () {
    return new Promise(
      function (resolve, reject) {
        try {
          this.state.web3Storage = new Web3Storage({
            token: WEB_3_STORAGE_TOKEN,
          })
          resolve()
        } catch (erorr) {
          reject(error)
        }
      }.bind(this)
    )
  },

  continueButtonClick: function () {
    if (this.state.testsPassed == 9) {
      this.htmlObjects.initializationDiv.style.display = 'None'
      this.htmlObjects.opaqueDiv.style.display = 'None'
    } else {
      alert('sorry the webpage is not loading correctly')
    }
  },

  refreshCidStatus: async function () {
    const status = await this.state.web3Storage.status(this.state.cid)
    console.log(status)
    if (status) {
      this.htmlObjects.cidStatus.innerText = 'File Stored on Web3.Storage'
    } else {
      this.htmlObjects.cidStatus.innerText = 'Not stored'
    }
  },

  refreshSignaturesButtonClick: async function () {
    await this.getSignatures()
    this.displayVars()
  },

  setupEventListeners: function () {
    return new Promise(
      function (resolve, reject) {
        try {
          this.htmlObjects.fileInput.addEventListener(
            'change',
            this.handleFiles.bind(this),
            false
          )
          this.htmlObjects.signCidButton.addEventListener(
            'click',
            this.signCid.bind(this)
          )
          this.htmlObjects.continueButton.addEventListener(
            'click',
            this.continueButtonClick.bind(this)
          )
          this.htmlObjects.refreshSignaturesButton.addEventListener(
            'click',
            this.refreshSignaturesButtonClick.bind(this)
          )
          this.htmlObjects.refreshCidStatusButton.addEventListener(
            'click',
            this.refreshCidStatus.bind(this)
          )
          resolve()
        } catch (error) {
          reject(error)
        }
      }.bind(this)
    )
  },

  // Handle a file being selected
  handleFiles: async function (event) {
    const files = event.srcElement.files
    if (files == undefined) {
      this.htmlObjects.cid.innerHTML = 'No file chosen'
      return
    }

    // Reset any potentially old transaction data
    this.state.transaction.status = 'available'
    this.state.transaction.numConfirmationBlocks = 0
    this.state.transactionHash = undefined
    this.state.transaction.etherscanAddress = undefined

    const storage = this.state.web3Storage

    function getFiles() {
      const fileInput = document.getElementById('fileInput')
      return fileInput.files
    }

    async function getCID(files) {
      const cid = await storage.put(files)
      return cid
    }

    // const files = getFiles()
    const cid = new CID(await getCID(files))
    this.state.cid = cid.toString()
    this.htmlObjects.cid.innerHTML = this.state.cid
    this.refreshCidStatus()

    // update display
    await this.getSignatures()
    this.displayVars()
  },

  displayVars: async function () {
    // Determine if lower two boxes should be shown
    // loaded to display the bottom boxes
    // Check if cid is loaded properly
    if (this.state.cid != undefined) {
      this.htmlObjects.leftDiv.style.display = 'block'
      this.htmlObjects.rightDiv.style.display = 'block'
      this.htmlObjects.numSignatures.innerHTML = this.state.signaturesLength.toString()
      this.handleSignaturesTable()

      //Right Div
      if (this.state.metamask) {
        this.htmlObjects.showAccount.innerHTML = this.state.account.toString()

        if (parseInt(this.state.network) in this.networkNameTranslate) {
          this.htmlObjects.showNetwork.innerHTML =
            this.state.network +
            ' - ' +
            this.networkNameTranslate[parseInt(this.state.network)]
        } else {
          this.htmlObjects.showNetwork.innerHTML =
            this.state.network + ' - Unknown Network'
        }

        // display transaction data
        if (this.state.transaction.status == 'available') {
          this.htmlObjects.transactionStatus.innerHTML =
            'No transaction underway'
          this.htmlObjects.numConfirmationBlocks.innerHTML =
            'No transaction underway'
          this.htmlObjects.etherscanAddress.innerHTML = 'N/A'
        }
      } else {
        this.htmlObjects.signCidButton.disabled = true
        this.htmlObjects.showAccount.innerHTML =
          'Connecting through Infura, connect with MetaMask to be able to sign the CID'

        // repeated code
        if (parseInt(this.state.network) in this.networkNameTranslate) {
          this.htmlObjects.showNetwork.innerHTML =
            this.state.network +
            ' - ' +
            this.networkNameTranslate[parseInt(this.state.network)]
        } else {
          this.htmlObjects.showNetwork.innerHTML =
            this.state.network + ' - Unknown Network'
        }
      }
    } else {
      this.htmlObjects.leftDiv.style.display = 'none'
      this.htmlObjects.rightDiv.style.display = 'none'
    }
  },

  getSignatures: function () {
    return new Promise((resolve, reject) => {
      this.state.ethSignContract.methods
        .getSigners(this.state.cid)
        .call()
        .then(
          function (receipt) {
            this.state.signatures.signers = receipt[0]
            this.state.signatures.signTimes = receipt[1]
            this.state.signaturesLength = this.state.signatures.signers.length
            resolve()
          }.bind(this)
        )
        .catch(console.log)
    })
  },

  // Visual updates should be split from this
  // Also the on 10 confirmations update should be split
  signCid: function () {
    // Make sure a transaction isn't currently underway
    if (this.state.transaction.status != 'available') {
      alert('Whoa there cowboy, you have a transaction already underway')
      return
    }
    this.state.ethSignContract.methods
      .signCID(this.state.cid)
      .send({ from: this.state.account[0] })

      .on('error', function (error) {
        // Enable file input
        this.htmlObjects.fileInput.disabled = false
      })
      .on('receipt', function (receipt) {})
      .on(
        'sent',
        function (sent) {
          console.log(sent)
        }.bind(this)
      )
      .on(
        'sending',
        function (sending) {
          this.htmlObjects.transactionStatus.innerHTML =
            'Pending MetaMask Confirmation'
          this.htmlObjects.numConfirmationBlocks.innerHTML =
            'Pending MetaMask Confirmation'
          this.state.transaction.status = 'pending'
          this.state.transaction.numConfirmationBlocks = 0

          // Disable file input
          this.htmlObjects.fileInput.disabled = true
        }.bind(this)
      )
      .on(
        'transactionHash',
        function (transactionHash) {
          this.state.transaction.transactionHash = transactionHash
          // Update Etherscan Address
          // Check for Rinkeby network, if not rinkeby this isn't going to work
          if (parseInt(this.state.network) == 4) {
            this.state.transaction.etherscanAddress =
              'http://rinkeby.etherscan.io/tx/' + transactionHash
            this.htmlObjects.etherscanAddress.innerHTML = `<a href="${this.state.transaction.etherscanAddress}" target="_blank">Link</a>`
          } else {
            this.state.transaction.etherscanAddress =
              'This network is not yet supported'
            this.htmlObjects.etherscanAddress.innerHTML = this.state.transaction.etherscanAddress
          }

          this.htmlObjects.transactionStatus.innerHTML =
            'Sending to Ethereum Blockchain'
          this.htmlObjects.numConfirmationBlocks.innerHTML =
            'Sending to Ethereum Blockchain'

          this.state.transaction.status = 'sending'
          this.state.transaction.numConfirmationBlocks = 0
        }.bind(this)
      )
      .on(
        'confirmation',
        async function (confirmationNumber, receipt, latestBlockHash) {
          this.state.transaction.numConfirmationBlocks = confirmationNumber

          if (confirmationNumber >= 10) {
            this.htmlObjects.numConfirmationBlocks.innerHTML = '10+'
            this.htmlObjects.transactionStatus.innerHTML = 'Complete'
            this.state.transaction.status = 'available'
            this.state.transaction.numConfirmationBlocks = 0
          } else {
            this.htmlObjects.transactionStatus.innerHTML =
              'Sent - Being confirmed (up to 8 minutes)'
            this.htmlObjects.numConfirmationBlocks.innerHTML = confirmationNumber
            this.state.transaction.status = 'sending'
            await this.getSignatures()
            this.displayVars()
          }
          // On 10th confirmation reload the sigs and update the display
          if (confirmationNumber === 10) {
            await this.getSignatures()
            this.displayVars()
            // Enable file input
            this.htmlObjects.fileInput.disabled = false
          }
        }.bind(this)
      )
  },

  // Check for signature values, if none hide table
  // If values then generate and update table
  handleSignaturesTable: async function () {
    // Clear old table, uh maybe should check for change instead of just clear
    // But what evs
    this.htmlObjects.signaturesTable.innerHTML = ''

    // Check for length == 0 if true hide it
    if (this.state.signaturesLength === 0) {
      this.htmlObjects.signaturesTable.style.display = 'none'
      return
    }
    // Set table element to display block
    this.htmlObjects.signaturesTable.style.display = 'table'

    // Make header
    let thead = this.htmlObjects.signaturesTable.createTHead()
    let row = thead.insertRow()

    let th1 = document.createElement('th')
    let text1 = document.createTextNode('Signing Account')
    th1.appendChild(text1)
    row.appendChild(th1)

    let th2 = document.createElement('th')
    let text2 = document.createTextNode('Date Signed')
    th2.appendChild(text2)
    row.appendChild(th2)

    let th3 = document.createElement('th')
    let text3 = document.createTextNode('Linked Domain')
    th3.appendChild(text3)
    row.appendChild(th3)

    for (let i = 0; i < this.state.signaturesLength; i++) {
      // Add signer
      let row = this.htmlObjects.signaturesTable.insertRow()
      let cell1 = row.insertCell()
      let text1 = document.createTextNode(this.state.signatures.signers[i])
      cell1.appendChild(text1)

      // Add dateSigned, adjust to human readable
      const unixTimestampMilliseconds =
        this.state.signatures.signTimes[i] * 1000
      const dateObject = new Date(unixTimestampMilliseconds)
      const signTime = dateObject.toUTCString() //2019-12-9 10:30:15
      let cell2 = row.insertCell()
      let text2 = document.createTextNode(signTime)
      cell2.appendChild(text2)

      // Add domain lookup data, yeah this definitely shouldn't be here
      // but it's a hackathon, also yes it shouldn't run on each unique without checking
      // if it's unique
      async function fetchDataJSON(url) {
        const response = await fetch(url)
        const data = await response.json()
        return data
      }

      const url =
        ADDRESS_DNS_API_URL + 'eth_' + this.state.signatures.signers[i] + '/'
      fetchDataJSON(url).then((data) => {
        let cell3Text = 'Lookup Error'
        if (data !== undefined) {
          if (data.domain !== undefined) {
            cell3Text = data.linked_domain
          } else {
            cell3Text = 'Not found'
          }
        }
        const cell3 = row.insertCell()
        const text3 = document.createTextNode(cell3Text)
        cell3.appendChild(text3)
      })
    }
  },
}

window.addEventListener('load', cidSign.initialize())
