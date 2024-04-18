import * as LitJsSdk from "@lit-protocol/lit-node-client";
import {ethers} from "ethers";
import {SiweMessage} from "siwe";
import {
  LitAccessControlConditionResource,
  LitAbility,
} from "@lit-protocol/auth-helpers";

export function EncryptDecrypt() {

    const run = async () => {
        
        const client = new LitJsSdk.LitNodeClient({
            litNetwork: "habanero", 
            debug: true,
        });
        
        const chain = "ethereum";
        
        const accessControlConditions = [
            {
              contractAddress: "",
              standardContractType: "",
              chain,
              method: "eth_getBalance",
              parameters: [":userAddress", "latest"],

              returnValueTest: {
                comparator: ">=",
                value: "000000000000", // 0.000001 ETH
              },
            },
        ];

        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
        console.log(authSig);
        class Lit {
            litNodeClient
            constructor(client){
                this.litNodeClient = client;
            }
            async connect() {
              await client.connect()
              this.litNodeClient = client
            }
            async getSession(){
              const walletWithCapacityCredit = new ethers.Wallet(
                  process.env.REACT_APP_PRIVATE_KEY
              );
              console.log(walletWithCapacityCredit)

              let nonce = client.getLatestBlockhash();
              console.log(nonce)

              // const { capacityDelegationAuthSig } =
              // await client.createCapacityDelegationAuthSig({
              //   uses: '1',
              //   dAppOwnerWallet: walletWithCapacityCredit,
              //   capacityTokenId: '12342452454',
              //   delegateeAddresses: [],
              // });
              // console.log(capacityDelegationAuthSig)
      
              /**
               * When the getSessionSigs function is called, it will generate a session key
               * and sign it using a callback function. The authNeededCallback parameter
               * in this function is optional. If you don't pass this callback,
               * then the user will be prompted to authenticate with their wallet.
               */
              const authNeededCallback = async ({
                  chain,
                  resources,
                  expiration,
                  uri,
              }) => {
                  const domain = "localhost:3000";
                  const message = new SiweMessage({
                      domain,
                      address: walletWithCapacityCredit.address,
                      statement: "Sign a session key to use with Lit Protocol",
                      uri,
                      version: "1",
                      chainId: "1",
                      expirationTime: expiration,
                      resources,
                      // nonce,
                  });
                  const toSign = message.prepareMessage();
                  const signature = await walletWithCapacityCredit.signMessage(toSign);
      
                  const authSig = {
                      sig: signature,
                      derivedVia: "web3.eth.personal.sign",
                      signedMessage: toSign,
                      address: walletWithCapacityCredit.address,
                  };
      
                  return authSig;
              };
              console.log("ok")
      
              // Create an access control condition resource
              const litResource = new LitAccessControlConditionResource(
                  '*'
              );
      
              const sessionSigs = await client.getSessionSigs({
                  chain: "ethereum",
                  resourceAbilityRequests: [
                      {
                          resource: litResource,
                          ability: LitAbility.AccessControlConditionDecryption,
                      },
                  ],
                  authNeededCallback,
              });
              console.log(sessionSigs);
              return sessionSigs
            }

            async encrypt(message) {
              const sessionSigs = await this.getSession();
                if (!this.litNodeClient) {
                  await this.connect()
                }
              
                // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
                const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
                  {
                    accessControlConditions,
                    // authSig,
                    sessionSigs,
                    chain,
                    dataToEncrypt: 'this is a secret message',
                  },
                  this.litNodeClient,
                );
              
                return {
                  ciphertext,
                  dataToEncryptHash,
                };
            }
          
            async decrypt(ciphertext, dataToEncryptHash, accessControlConditions) {
              const sessionSigs = await this.getSession();
              if (!this.litNodeClient) {
                await this.connect()
              }
              
              // const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
              const decryptedString = await LitJsSdk.decryptToString(
                {
                  accessControlConditions,
                  ciphertext,
                  dataToEncryptHash,
                  // authSig,
                  sessionSigs,
                  chain,
                },
                this.litNodeClient,
              );
              return { decryptedString }
            }
        }

        let myLit = new Lit(client)
        await myLit.connect()

        const { ciphertext, dataToEncryptHash } = await myLit.encrypt()
        console.log(ciphertext, dataToEncryptHash);
        
        const data = await myLit.decrypt(ciphertext, dataToEncryptHash, accessControlConditions)
        console.log(data)
    }

    return (
      <div>
        <button onClick={run}>Encrypt/Decrypt</button>
      </div>
    );
}