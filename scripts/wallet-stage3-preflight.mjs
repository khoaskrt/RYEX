import { JsonRpcProvider, Wallet, Contract, formatEther, formatUnits } from 'ethers';

const rpc = process.env.BSC_TESTNET_RPC_URL || '';
const senderPk = process.env.BSC_TESTNET_SENDER_PRIVATE_KEY || '';
const senderEnvAddress = process.env.BSC_TESTNET_SENDER_ADDRESS || '';
const usdtContract = process.env.USDT_CONTRACT_ADDRESS_TESTNET || '';

function asBool(value) {
  return Boolean(String(value || '').trim());
}

async function main() {
  const report = {
    env: {
      hasRpc: asBool(rpc),
      hasSenderPrivateKey: asBool(senderPk),
      hasSenderAddress: asBool(senderEnvAddress),
      hasUsdtContract: asBool(usdtContract),
    },
    chain: {
      chainId: null,
      latestBlock: null,
    },
    sender: {
      derivedAddress: '',
      matchesEnvAddress: false,
      bnbBalance: null,
      usdtBalance: null,
      usdtDecimals: null,
    },
    ready: {
      infraReady: false,
      usdtReady: false,
    },
  };

  if (!report.env.hasRpc || !report.env.hasSenderPrivateKey || !report.env.hasSenderAddress) {
    console.log(JSON.stringify(report, null, 2));
    process.exit(1);
  }

  const provider = new JsonRpcProvider(rpc);
  const wallet = new Wallet(senderPk, provider);

  report.sender.derivedAddress = wallet.address;
  report.sender.matchesEnvAddress = wallet.address.toLowerCase() === senderEnvAddress.toLowerCase();

  const [network, latestBlock, bnbBalanceRaw] = await Promise.all([
    provider.getNetwork(),
    provider.getBlockNumber(),
    provider.getBalance(wallet.address),
  ]);

  report.chain.chainId = Number(network.chainId);
  report.chain.latestBlock = latestBlock;
  report.sender.bnbBalance = formatEther(bnbBalanceRaw);

  if (report.env.hasUsdtContract) {
    try {
      const erc20 = new Contract(
        usdtContract,
        ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
        provider
      );
      const [rawBalance, decimals] = await Promise.all([erc20.balanceOf(wallet.address), erc20.decimals()]);
      report.sender.usdtDecimals = Number(decimals);
      report.sender.usdtBalance = formatUnits(rawBalance, decimals);
    } catch (error) {
      report.sender.usdtBalance = `error:${error?.shortMessage || error?.message || 'unknown'}`;
    }
  }

  const bnbEnough = Number(report.sender.bnbBalance || '0') > 0;
  const usdtEnough = Number(report.sender.usdtBalance || '0') > 0;

  report.ready.infraReady =
    report.sender.matchesEnvAddress && report.chain.chainId === 97 && bnbEnough;
  report.ready.usdtReady = report.ready.infraReady && report.env.hasUsdtContract && usdtEnough;

  console.log(JSON.stringify(report, null, 2));
  process.exit(report.ready.usdtReady ? 0 : 2);
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        error: {
          message: error?.message || 'Unknown preflight error',
        },
      },
      null,
      2
    )
  );
  process.exit(3);
});
