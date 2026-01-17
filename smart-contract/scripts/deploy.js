const hre = require("hardhat");

async function main() {
  console.log("💀 开始部署死亡契约到 Monad...");

  const AmIDeadYet = await hre.ethers.getContractFactory("AmIDeadYet");
  const contract = await AmIDeadYet.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log(`
----------------------------------------------------
⚰️  合约已部署!
----------------------------------------------------
📍 地址: ${address}
🌐 网络: Monad
----------------------------------------------------
👉 请将此地址复制到前端的 .env.local 文件中
   VITE_CONTRACT_ADDRESS=${address}
----------------------------------------------------
`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
