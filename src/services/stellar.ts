import { 
  Horizon,
  Keypair,
  TransactionBuilder,
  Networks,
  Operation,
  Asset
} from 'stellar-sdk';

export const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// ✅ REAL FUNDED ADDRESSES FROM STELLAR LAB
// These represent the Campus Merchants you just activated
export const SERVICE_ADDRESSES = {
  canteen: 'GDVBHKB5XUMGP4RZI37MTFI43CTOCWEBKT2AQB5XG44DF2QSKEU4GWOJ', 
  bike: 'GAQOMTKBPF7RSFSQWCLOAJWZJOKB2HA7JD7IAZ4MLBA2P36JNFIT26JM',
  power: 'GBGK4XWGW36DBD6MHNE2IDD7OQG3CU4SM4LCT5QVRBBJMVOC5AFCTO3W',
  books: 'GD6HUO27ZGTM5ZM44XHMK35UV567E3OBTQ7KD76ZFPXYSYST4J2TE23U',
};

// Your Campus Treasury (The Bank for Rewards)
export const TREASURY_PUBLIC_KEY = 'GBMHHXLRH6F3OVJG2AAHEC57FM4K5YKSWHE7KHOT3BMLSBXE2MV6Z5ED';

export const StellarService = {
  async getBalance(address: string) {
    try {
      const account = await server.loadAccount(address);
      const nativeBalance = account.balances.find((b: any) => b.asset_type === 'native');
      const xlmAmount = nativeBalance ? nativeBalance.balance : '0.00';

      return {
        xlm: xlmAmount,
        // ✅ DE-HARDCODED: Derived from real XLM balance
        points: (parseFloat(xlmAmount) * 100).toFixed(0), 
        tokens: (parseFloat(xlmAmount) / 10).toFixed(2)
      };
    } catch (e) {
      console.error('Failed to load Stellar account balance', e);
      return { xlm: '0.00', points: '0', tokens: '0' };
    }
  },

  async payWithXLM(senderSecret: string, recipient: string, amount: string) {
    try {
      const sourceKeypair = Keypair.fromSecret(senderSecret);
      const account = await server.loadAccount(sourceKeypair.publicKey());

      const transaction = new TransactionBuilder(account, { fee: '100' })
        .addOperation(Operation.payment({
          destination: recipient,
          asset: Asset.native(),
          amount: amount,
        }))
        .setNetworkPassphrase(Networks.TESTNET)
        .setTimeout(30)
        .build();

      transaction.sign(sourceKeypair);
      return await server.submitTransaction(transaction);
    } catch (e) {
      console.error('Transaction failed', e);
      throw e;
    }
  },

  async getHistory(address: string) {
    try {
      const txs = await server.transactions()
        .forAccount(address)
        .limit(10)
        .order('desc')
        .call();
      
      return txs.records.map(record => ({
        id: record.id,
        hash: record.hash,
        date: new Date(record.created_at).toLocaleDateString(),
        time: new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        memo: record.memo || 'Campus Transaction',
        successful: record.successful
      }));
    } catch (e) {
      console.error('Failed to fetch Stellar history', e);
      return [];
    }
  }
};