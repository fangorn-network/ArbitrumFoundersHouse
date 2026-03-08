// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.25;

import "@fhenixprotocol/cofhe-contracts/FHE.sol";

contract PatientEvaluator {
    euint32 public count;

    constructor() {
        count = FHE.asEuint32(0);

        FHE.allowThis(count);
        FHE.allowSender(count);
    }

    function countMatchSpecific(
        InEuint32[] calldata patientTypes,
        InEuint32 calldata bloodType
    ) public {
        require(patientTypes.length <= 100, "Too many inputs");

        euint32 bloodTypeEuint = FHE.asEuint32(bloodType);

        euint32 localCount = FHE.asEuint32(0);
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        for (uint256 i = 0; i < patientTypes.length; i++) {
            euint32 patientType = FHE.asEuint32(patientTypes[i]);

            ebool isMatch = FHE.eq(patientType, bloodTypeEuint);

            euint32 increment = FHE.select(isMatch, one, zero);

            localCount = FHE.add(localCount, increment);
        }

        count = localCount;

        FHE.allowThis(count);
        FHE.allowSender(count);
        FHE.allowGlobal(count);
    }

    function reset() public {
        count = FHE.asEuint32(0);

        FHE.allowThis(count);
        FHE.allowSender(count);
    }

    function getMatchedTypeCount() public view returns (euint32) {
        return count;
    }
}
