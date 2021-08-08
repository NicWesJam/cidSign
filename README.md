# 📦 cidSign

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Sign your CIDs using Ethereum addresses linked to DNS entries.

This project is an entry for HackFS 2021

Check frontend demo on https://thinkingzoo.com
And backend demo https://thinkingzoo.com:441

This project let's CIDs be uploaded through Web3.Storage signed using etheruem addresses, signers are linked to domain names using a custom api endpoint. Different from existing solutions this method creates a permanent copy of the file and a permanent signature both through employing various blockchains. 

Example use case is that a school could sign a pdf transcript copy and create a permanent stamp of authenticity saving time both for those verifying transcripts and the schools responding to verification requests.

## Installation

Check relevant subdirectory for install details

## Usage

- Add a domain txt record in the format "v=blockAddress1 type=eth address={Ethereum address}"
- Add domain to api endpoint {your domain} https://thinkingzoo.com:441/domain/{your domain}/ note this will also refresh this domain
- Front end needs to be accessed using metamask on Rinkeby test network. Select a file to check signatures on and sign if you want.
- Chrome extension go to chrome, extension, turn on developer more, select unpacked extension, navigate to folder. It will scan the page for any loaded Ethereum addresses and check Al against the api. Click the icon to see the results.

## Features 

- [Filecoin]
- [IPFS]
- [Ethereum]
- [Web3]
- [Django]
- [Django-Rest-Framework]

## Author

- [Nicholas Wesley-James]

## License

This project is open source and available under the [MIT License](LICENSE).
