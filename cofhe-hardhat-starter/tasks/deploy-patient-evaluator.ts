import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { saveDeployment } from './utils'


task('deploy-patient-evaluator', 'Deploy the Patient Evaluator contract to the selected network').setAction(async (_, hre: HardhatRuntimeEnvironment) => {
	const { ethers, network } = hre

	console.log(`Deploying Evaluator to ${network.name}...`)

	// Get the deployer account
	const [deployer] = await ethers.getSigners()
    console.log(deployer)
	console.log(`Deploying with account: ${deployer.address}`)

	// Deploy the contract
	const PatientEvaluator = await ethers.getContractFactory('PatientEvaluator')
	const patientEvaluator = await PatientEvaluator.deploy()
    console.log("Waiting for deployment")
	await patientEvaluator.waitForDeployment()

    console.log("Should be deployed")
    console.log(patientEvaluator.getAddress())
	const patientEvaluatorAddress = await patientEvaluator.getAddress()
	console.log(`Patient Evaluator deployed to: ${patientEvaluatorAddress}`)

	// Save the deployment
	saveDeployment(network.name, 'PatientEvaluator', patientEvaluatorAddress)

	return patientEvaluatorAddress
})