// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title SignCID
 * @dev Store & retrieve IPFS CID related to ETH addresses
 */

contract SignCID {
    
    // I think this might be a confusing term, unsure if what I am doing counts as a signature
    struct Signature {
        address signer;   // address of the ETH account signing the hash
        uint signTime; // datetime hash is being signed
    }

    // list of signatures
    mapping(uint256 => Signature[]) signatures;

    function signCID(uint256 _cid) public {
        signatures[_cid].push (Signature({
            signer: msg.sender,
            signTime: block.timestamp
        }));
    }
    
    // returns two arrays, one of signers and one of corresponding sign times
    // Any feedback on how to better return the data is welcome
    function getSigners(uint256 _cid) external view returns (address [] memory,uint256 [] memory) {
        address[] memory signers = new address[](signatures[_cid].length);
        uint256[] memory signTimes =  new uint256[](signatures[_cid].length);
        for (uint i = 0; i < signatures[_cid].length; i++) {
            signers[i] = (signatures[_cid][i].signer);
            signTimes[i] = (signatures[_cid][i].signTime);
        }
        return (signers,signTimes);
    }
}