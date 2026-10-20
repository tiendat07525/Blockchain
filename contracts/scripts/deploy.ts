import { network } from "hardhat";
import { writeFileSync, mkdirSync } from "node:fs";

const SEPOLIA_CHAIN_ID = 11155111n;

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Deployer:", deployer.address, "| chainId:", chainId.toString());

  // 1,000,000 TFG (18 decimals). Đổi con số này nếu bạn muốn supply khác
  const initialSupply = ethers.parseUnits("1000000", 18);

  const token = await ethers.deployContract("TokenForge", [
    deployer.address, // initialOwner
    initialSupply,
  ]);
  await token.waitForDeployment();

  const address = await token.getAddress();
  const tx = token.deploymentTransaction()!;
  const receipt = (await tx.wait())!;
  console.log("TokenForge:", address, "| block:", receipt.blockNumber);
  // Chỉ ghi file khi deploy thật lên Sepolia, tránh ghi đè bởi lần chạy local
  if (chainId === SEPOLIA_CHAIN_ID) {
    mkdirSync("deployments", { recursive: true });
    writeFileSync(
      "deployments/sepolia.json",
      JSON.stringify(
        {
          chainId: Number(chainId),
          address,
          deployBlock: receipt.blockNumber,
          txHash: tx.hash,
          initialOwner: deployer.address,
          initialSupply: initialSupply.toString(),
        },
        null,
        2
      )
    );
    console.log("Saved deployments/sepolia.json");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});