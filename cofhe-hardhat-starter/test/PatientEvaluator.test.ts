import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import hre from 'hardhat'
import { cofhejs, Encryptable, FheTypes } from 'cofhejs/node'

describe('PatientEvaluatorTest', function () {
	async function deployCounterFixture() {
		// Contracts are deployed using the first signer/account by default
		const [signer, signer2, bob, alice] = await hre.ethers.getSigners()

		const PatientEvaluator = await hre.ethers.getContractFactory('PatientEvaluator')
		const patientEvaluator = await PatientEvaluator.connect(bob).deploy()

		return { patientEvaluator, signer, bob, alice }
	}

	describe('Functionality', function () {
		beforeEach(function () {
			if (!hre.cofhe.isPermittedEnvironment('MOCK')) this.skip()

			// NOTE: Uncomment for global logging
			// hre.cofhe.mocks.enableLogs()
		})

		afterEach(function () {
			if (!hre.cofhe.isPermittedEnvironment('MOCK')) return

			// NOTE: Uncomment for global logging
			// hre.cofhe.mocks.disableLogs()
		})

		it('Should count properly', async function () {
			const { patientEvaluator, bob } = await loadFixture(deployCounterFixture)
            // const BLOOD_TYPE = { "A+": 0, "A-": 1, "B+": 2, "B-": 3, "AB+": 4, "AB-": 5, "O+": 6, "O-": 7 };
            const patientOne   = await cofhejs.encrypt([Encryptable.uint32(2n)] as const) // B+
            const patientTwo   = await cofhejs.encrypt([Encryptable.uint32(0n)] as const) // A+
            const patientThree = await cofhejs.encrypt([Encryptable.uint32(2n)] as const) // B+
            console.log("Pateint one", patientOne);
            const patients = [patientOne.data[0], patientTwo.data[0], patientThree.data[0]];
	        await patientEvaluator.countMatch(patients);
            const count = await patientEvaluator.getCounts();

            console.log(count)

			await hre.cofhe.mocks.expectPlaintext(count[0], 1n);
            await hre.cofhe.mocks.expectPlaintext(count[6], 0n);
            await hre.cofhe.mocks.expectPlaintext(count[2], 2n);
		})
	})
})
