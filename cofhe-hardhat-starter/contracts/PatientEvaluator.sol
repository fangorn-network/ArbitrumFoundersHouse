// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract PatientEvaluator {
    euint32 public count;
    euint32 public ONE;
    euint32 public ZERO;
    // ["A+": 0, "A-": 1, "B+": 2, "B-": 3, "AB+": 4, "AB-": 5, "O+": 6, "O-": 7]
    euint32[8] public countArray; 
    uint32[8] public decryptedCountArray;
    ebool public isInitialized;

    constructor() {
        ONE = FHE.asEuint32(1);
        ZERO = FHE.asEuint32(0);
        count = FHE.asEuint32(0);


        for (uint i = 0; i < 8; i++) {
            countArray[i] = ZERO;
            decryptedCountArray[i] = 0;
        }

        isInitialized = FHE.asEbool(false);
        isInitialized = FHE.asEbool(true);

        FHE.allowThis(count);
        FHE.allowThis(ONE);
        FHE.allowThis(ZERO);

        FHE.gte(count, ONE);

        FHE.allowSender(count);
    }

function countMatch(InEuint32[] calldata patientTypes) public {
    for (uint i = 0; i < patientTypes.length; i++) {
        // 0, 1, 2,... 7
        euint32 patientType = FHE.asEuint32(patientTypes[i]);
        for (uint32 j = 0; j < 8; j++) {
            ebool isMatch = FHE.eq(patientType, FHE.asEuint32(j));
            euint32 increment = FHE.select(isMatch, FHE.asEuint32(1), FHE.asEuint32(0));
            countArray[j] = FHE.add(countArray[j], increment);
        }
    }
    // Allow the caller to access the results
    for (uint i = 0; i < 8; i++) {
        FHE.allowSender(countArray[i]);
        FHE.allowThis(countArray[i]);
    }
}

function countMatchSpecific(InEuint32[] calldata patientTypes, InEuint32 calldata bloodType) public {
    euint32 bloodTypeEuint = FHE.asEuint32(bloodType);
    for (uint i = 0; i < patientTypes.length; i++) {
        // 0, 1, 2,... 7
        euint32 patientType = FHE.asEuint32(patientTypes[i]);
        ebool isMatch = FHE.eq(patientType, bloodTypeEuint);
        euint32 increment = FHE.select(isMatch, ONE, ZERO);
        count = FHE.add(count, increment);
    }
    FHE.allowSender(count);
    FHE.allowThis(count);
    FHE.allowGlobal(count);
}

function reset() public {
    count = ZERO;
    for (uint i = 0; i < 8; i++) {
        countArray[i] = ZERO;
        decryptedCountArray[i] = 0;
    }

    FHE.allowThis(count);
    FHE.allowSender(count);
}

function getAllTypesCount() public view returns (euint32[8] memory) {
    return countArray;
}

function decryptCountArray() public {
    for (uint i = 0; i < 8; i++) {
        FHE.decrypt(countArray[i]);
    }
}

function retrieveDecryptedValues() public returns(uint32[8] memory decryptedVals , bool allReady) {

    allReady = true;
    for (uint i = 0; i < 8; i++) {
        (uint32 val1, bool ready1) = FHE.getDecryptResultSafe(countArray[i]);
        allReady = allReady && ready1;
        decryptedCountArray[i] = val1;
    }

    return (decryptedCountArray, allReady);

}

function getMatchedTypeCount() public view returns (euint32 finalcount) {
     // Everyone can now access this valu
    return count;
}
}
