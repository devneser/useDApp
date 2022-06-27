import { Web3Provider } from '@ethersproject/providers'
import { Connector, ConnectorPriority, UpdateFn } from '../connector'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { IWalletConnectProviderOptions } from '@walletconnect/types'

export class WalletConnectConnector implements Connector {
  static tag = 'waletconnect'
  public provider?: Web3Provider
  public priority = ConnectorPriority.Wallet
  public name = 'WalletConnect'

  constructor(private opts: IWalletConnectProviderOptions) {}

  onUpdate?: UpdateFn

  private async init() {
    if (this.provider) return
    try {
      const walletConnectProvider = new WalletConnectProvider(this.opts)
      this.provider = new Web3Provider(walletConnectProvider)
    } catch (e) {
      console.log(e)
    }
  }

  public getTag(): string {
    return WalletConnectConnector.tag
  }

  async connectEagerly(): Promise<void> {
    await this.init()
    try {
      const chainId: string = await this.provider!.send('eth_chainId', [])
      const accounts: string[] = await this.provider!.send('eth_accounts', [])
      this.onUpdate?.({ chainId: parseInt(chainId), accounts })
    } catch (e) {
      console.log(e)
    }
  }

  async activate(): Promise<void> {
    await this.init()
    try {
      await (this.provider?.provider as WalletConnectProvider).enable()
      const chainId: string = await this.provider!.send('eth_chainId', [])
      const accounts: string[] = await this.provider!.send('eth_requestAccounts', [])
      this.onUpdate?.({ chainId: parseInt(chainId), accounts })
    } catch (e) {
      console.log(e)
    }
  }

  async deactivate(): Promise<void> {
    return
  }
}
