import { createPublicClient, http, parseEther, parseGwei, toHex } from 'viem'
import { waitForTransactionReceipt } from 'viem/_types/actions/public/waitForTransactionReceipt';
import { privateKeyToAccount } from 'viem/accounts';
import { polygon } from "viem/chains";
import config from './config';

const get_transaction = async (text_data: string) => {
  const client = createPublicClient({
    chain: polygon,
    transport: http(config.rpcUrl)
  })

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  const value = parseEther(config.payPrice);
  const data_hex = toHex(text_data);
  const gas_estimate = await client.estimateGas({
    account,
    to: account.address,
    value: value,
    data: data_hex
  })
  const currentGasPrice = await client.getGasPrice();
  const gasMultiple = parseInt(String(config.increaseGas * 100))
  const increasedGasPrice = currentGasPrice / BigInt(100) * BigInt(gasMultiple);

  const transaction = {
    to: account.address,
    // 替换为你要转账的金额
    value: value,
    // 十六进制数据
    data: data_hex,
    // 设置 gas 价格
    gasPrice: increasedGasPrice,
    // 限制gasLimit，根据当前网络转账的设置，不知道设置多少的去区块浏览器看别人转账成功的是多少
    gasLimit: gas_estimate,
  }

  const request = await client.prepareTransactionRequest({
    ...transaction,
    account
  })
  console.log(request);

  const signed_transaction = await account.signTransaction({
    ...request,
    chainId: client.chain.id
  })
  const hash = await client.sendRawTransaction({ serializedTransaction: signed_transaction })
  await waitForTransactionReceipt(client, {
    hash,
  })

}


const main = async () => {
  await get_transaction(config.tokenJson);
}


//运行50次
for (const [iter, index] of Array(config.repeatCount).entries()) {
  console.log(`第${iter}次`);
  await main();
  await new Promise((resolve) => setTimeout(resolve, config.sleepTime));
}

