import { MockProvider } from 'ethereum-waffle'
import { Wallet } from 'ethers'
import { ChainId, MulticallAddresses } from '../../constants'
import { deployMulticall, deployMulticall2 } from './deployMulticall'
import { mineBlock } from './mineBlock'

export interface CreateMockProviderOptions {
  chainId?: ChainId,
  multicallVersion?: 1 | 2
}

export interface CreateMockProviderResult {
  provider: MockProvider,
  multicallAddresses: MulticallAddresses,
  wallets: Wallet[],
  deployer: Wallet,
  chainId: ChainId,
  mineBlock: () => Promise<void>
}
export type TestingNetwork = CreateMockProviderResult

/**
 * Creates a MockProvider, with an option to override `chainId`.
 * Automatically deploys multicall.
 */
export const createMockProvider = async (opts: CreateMockProviderOptions = {}): Promise<CreateMockProviderResult> => {
  const chainId = opts.chainId ?? ChainId.Mainnet
  const provider = new MockProvider({ ganacheOptions: { _chainIdRpc: chainId } as any })
  const multicallAddresses = await (
    opts.multicallVersion === 2 ? deployMulticall2(provider, chainId) : deployMulticall(provider, chainId)
  )

  const mineBlock = async () => {
    await provider.send('evm_mine', [])
  }

  return {
    provider,
    multicallAddresses,
    wallets: provider.getWallets(),
    deployer: provider.getWallets()[0],
    chainId,
    mineBlock
  }
}
