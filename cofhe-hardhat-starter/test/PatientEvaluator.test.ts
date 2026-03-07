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

		it('Should count all types properly', async function () {
			const { patientEvaluator, bob } = await loadFixture(deployCounterFixture)
            // const BLOOD_TYPE = { "A+": 0, "A-": 1, "B+": 2, "B-": 3, "AB+": 4, "AB-": 5, "O+": 6, "O-": 7 };
			// 2 B+ and one A+
            const patientData   = await cofhejs.encrypt([Encryptable.uint32(2n), Encryptable.uint32(0n), Encryptable.uint32(2n)] as const) // B+
	        await patientEvaluator.countMatch(patientData.data);
            const count = await patientEvaluator.getAllTypesCount();

            console.log(count)

			await hre.cofhe.mocks.expectPlaintext(count[0], 1n);
            await hre.cofhe.mocks.expectPlaintext(count[6], 0n);
            await hre.cofhe.mocks.expectPlaintext(count[2], 2n);

			await patientEvaluator.reset();
		})
		it('Should count a specific type properly', async function () {
			const { patientEvaluator, bob } = await loadFixture(deployCounterFixture)
            // const BLOOD_TYPE = { "A+": 0, "A-": 1, "B+": 2, "B-": 3, "AB+": 4, "AB-": 5, "O+": 6, "O-": 7 };
			// 2 B+ and one A+
            const patientData   = await cofhejs.encrypt([Encryptable.uint32(2n), Encryptable.uint32(0n), Encryptable.uint32(2n)] as const) // B+
            console.log("Patient one", patientData);
			const targetType = await cofhejs.encrypt([Encryptable.uint32(2n)])
			console.log("Target Type", targetType);
	        await patientEvaluator.countMatchSpecific(patientData.data, targetType.data[0]);
            const count = await patientEvaluator.getMatchedTypeCount();

            console.log(count)

			await hre.cofhe.mocks.expectPlaintext(count, 2n);
			await patientEvaluator.reset();
		})
	})
})
