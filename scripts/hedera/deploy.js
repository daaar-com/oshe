const { Client, TokenCreateTransaction, Hbar, TokenType, TokenSupplyType, PrivateKey} = require("@hashgraph/sdk");
require("dotenv").config();
async function main() {
    console.log('Deployment starting');

    const myAccountId = process.env.HEDERA_ACCOUNT_ID;
    const myPrivateKey = process.env.HEDERA_PRIVATE_KEY;
    const myPublicKey = process.env.HEDERA_PUBLIC_KEY;
    if (!myAccountId || !myPrivateKey) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }
    const adminKey = PrivateKey.fromString(myPrivateKey);
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    // Create the transaction and freeze for manual signing
    const transaction = await new TokenCreateTransaction()
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setTokenName("OSHE! Token")
        .setTokenSymbol("OSHE")
        .setTreasuryAccountId(myAccountId)
        .setAdminKey(adminKey)
        .setInitialSupply(10**6)
        .setMaxSupply(10**9)
        .setMaxTransactionFee(new Hbar(30)) //Change the default max transaction fee
        .freezeWith(client);

    // Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    // Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    // Get the token ID from the receipt
    const tokenId = receipt.tokenId;

    console.log("The new token ID is " + tokenId);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
