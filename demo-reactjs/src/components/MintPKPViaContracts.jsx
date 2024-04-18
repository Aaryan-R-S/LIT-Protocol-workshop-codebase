import React from 'react';
import { ethers } from 'ethers';
import { siwe, SiweMessage } from 'siwe';
import { checkAndSignAuthMessage, LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { LitAuthClient } from '@lit-protocol/lit-auth-client';
import { AuthMethodScope, AuthMethodType } from '@lit-protocol/constants';
import { LitAbility, LitActionResource, LitPKPResource } from '@lit-protocol/auth-helpers';

export function MintPKPViaContracts() {

  async function withAuthSig() {

    // 1. Create a wallet
    const provider = new ethers.providers.Web3Provider( window.ethereum, "any" );
    const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
    const address = wallet.address;
    console.log('address:', address)
    // console.log('privateKey:', wallet.privateKey)

    // 2. Connect to lit node client
    const litNodeClient = new LitNodeClient({ litNetwork: 'habanero' });
    await litNodeClient.connect();


    // 3. Connect to contract client (contract client mints PKP)
    const contractClient = new LitContracts({
      signer: wallet,
    });
    await contractClient.connect();


    // 4. Get nonce & subsequent mint cost
    const nonce = litNodeClient.getLatestBlockhash();
    const mintCost = await contractClient.pkpNftContract.read.mintCost(); 
    console.log("Got mintcost: "+mintCost);


    // 5. Get signature of the wallet (should be the same address as the signer in the contract client)
    const authSig = await checkAndSignAuthMessage({
      chain: "ethereum",
      nonce,
    });
    
    console.log("authSig received: "+JSON.stringify(authSig));

    // 6. Setting up auth method -> sign of the wallet
    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };


    // 7. Mint PKP
    const mintInfo = await contractClient.mintWithAuth({
      authMethod,
      scopes: [
        AuthMethodScope.NoPermissions,
        AuthMethodScope.SignAnything,
        AuthMethodScope.PersonalSign,
      ],
    });

    const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
    const scopes = await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      mintInfo.pkp.tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

    const signAnythingScope = scopes[1];
    const personalSignScope = scopes[2];
    console.log(signAnythingScope + "---" + personalSignScope);

    const walletPKPInfo = {
      tokenId: mintInfo.pkp.tokenId,
      publicKey: `0x${mintInfo.pkp.publicKey}`,
      ethAddress: mintInfo.pkp.ethAddress,
    };
  
    console.log('WalletPKPInfo', walletPKPInfo);

    // 8. Use pkp to sign a message using auth sig
    const litActionCode = `
        const go = async () => {
        // The params toSign, publicKey, sigName are passed from the jsParams fields and are available here
        // const sigShare = await Lit.Actions.signEcda({ toSign, publicKey, sigName });
        };

        go();
    `;

    const signatures =
     await litNodeClient.executeJs({
      code: litActionCode,
      authSig,
      jsParams: {
        toSign: [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
        publicKey: mintInfo.pkp.publicKey,
        sigName: "sig1",
      },
    });

    console.log("signatures: ", signatures);
  }

  async function withSessionSigs() {

    // 1. Create a wallet
    const provider = new ethers.providers.Web3Provider( window.ethereum, "any" );
    const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
    const address = wallet.address;
    console.log('address:', address)
    // console.log('privateKey:', wallet.privateKey)

    // 2. Connect to lit node client
    const litNodeClient = new LitNodeClient({ litNetwork: 'habanero' });
    await litNodeClient.connect();


    // 3. Connect to contract client (contract client mints PKP)
    const contractClient = new LitContracts({
      signer: wallet,
    });
    await contractClient.connect();


    // 4. Get nonce & subsequent mint cost
    const nonce = litNodeClient.getLatestBlockhash();
    const mintCost = await contractClient.pkpNftContract.read.mintCost(); 
    console.log("Got mintcost: "+mintCost);


    // 5. Get signature of the wallet (should be the same address as the signer in the contract client)
    // Craft the SIWE message
    const domain = 'localhost';
    const origin = 'https://localhost:3000';
    const statement =
      'This is a test statement.  You can put anything you want here.';
        
    // expiration time in ISO 8601 format.  This is 7 days in the future, calculated in milliseconds
    const expirationTime = new Date(
      Date.now() + 1000 * 60 * 60 * 24 * 7 * 10000
    ).toISOString();

    const siweMessage = new SiweMessage({
      domain,
      address: address,
      statement,
      uri: origin,
      version: '1',
      chainId: 1,
      nonce,
      expirationTime,
    });
    const messageToSign = siweMessage.prepareMessage();
      
    // Sign the message and format the authSig
    const signature = await wallet.signMessage(messageToSign);
  
    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: messageToSign,
      address: address,
    };

    console.log("authSig: ", authSig);

    // 6. Setting up auth method -> sign of the wallet
    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };


    // 7. Mint PKP
    const mintInfo = await contractClient.mintWithAuth({
      authMethod,
      scopes: [
        AuthMethodScope.NoPermissions,
        AuthMethodScope.SignAnything,
        AuthMethodScope.PersonalSign,
      ],
    });

    const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
    const scopes = await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      mintInfo.pkp.tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

    const signAnythingScope = scopes[1];
    const personalSignScope = scopes[2];
    console.log(signAnythingScope + "---" + personalSignScope);

    const walletPKPInfo = {
      tokenId: mintInfo.pkp.tokenId,
      publicKey: `0x${mintInfo.pkp.publicKey}`,
      ethAddress: mintInfo.pkp.ethAddress,
    };
  
    console.log('WalletPKPInfo', walletPKPInfo);

    // 8. Get sessionSigs
    const authNeededCallback = async ({
        chain,
        resources,
        expiration,
        uri,
    }) => {
        const domain = "localhost:3000";
        const message = new SiweMessage({
            domain,
            address,
            statement: "Sign a session key to use with Lit Protocol",
            uri,
            version: "1",
            chainId: "1",
            expirationTime: expiration,
            resources,
            // nonce,
        });
        const toSign = message.prepareMessage();
        const signature = await wallet.signMessage(toSign);

        const authSig = {
            sig: signature,
            derivedVia: "web3.eth.personal.sign",
            signedMessage: toSign,
            address,
        };

        return authSig;
    };
      
      // Set resources to allow for signing of any message.
    const resourceAbilities = [
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.PKPSigning,
      },
    ];

    // Get the session key for the session signing request
    // will be accessed from local storage or created just in time.
    const sessionKeyPair = litNodeClient.getSessionKey();
    console.log('sessionKeyPair: ', sessionKeyPair);

    // Request a session with the callback to sign
    // with an EOA wallet from the custom auth needed callback created above.
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain: "ethereum",
      expiration: expirationTime,
      resourceAbilityRequests: resourceAbilities,
      authNeededCallback,
    });

    console.log("sessionSigs: ", sessionSigs);

    // 9. Use pkp to sign a message using session sigs
    const litActionCode = `
        const go = async () => {
        // The params toSign, publicKey, sigName are passed from the jsParams fields and are available here
        // const sigShare = await Lit.Actions.signEcda({ toSign, publicKey, sigName });
        };

        go();
    `;

    const signaturesUsingSessionSig = await litNodeClient.executeJs({
      code: litActionCode,
      sessionSigs,
      jsParams: {
        toSign: [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
        publicKey: mintInfo.pkp.publicKey,
        sigName: "sig1",
      },
    });

    console.log("signatures: ", signaturesUsingSessionSig);
  }

  async function mintCapacityCredit(){

    // 1. Create a wallet
    const provider = new ethers.providers.Web3Provider( window.ethereum, "any" );
    const wallet = new ethers.Wallet(process.env.REACT_APP_PRIVATE_KEY, provider);
    const address = wallet.address;
    console.log('address:', address)
    // console.log('privateKey:', wallet.privateKey)

    // 2. Connect to lit node client
    const litNodeClient = new LitNodeClient({ litNetwork: 'habanero' });
    await litNodeClient.connect();

    // 3. Connect to contract client (contract client mints PKP)
    const contractClient = new LitContracts({
      signer: wallet,
    });
    await contractClient.connect();

    // 4. Get nonce & subsequent mint cost
    const nonce = litNodeClient.getLatestBlockhash();
    const mintCost = await contractClient.pkpNftContract.read.mintCost(); 
    console.log("Got mintcost: "+mintCost);


    // 5. Get signature of the wallet (should be the same address as the signer in the contract client)
    const authSig = await checkAndSignAuthMessage({
      chain: "ethereum",
      nonce,
    });
    
    console.log("authSig received: "+JSON.stringify(authSig));

    // 6. Setting up auth method -> sign of the wallet
    const authMethod = {
      authMethodType: AuthMethodType.EthWallet,
      accessToken: JSON.stringify(authSig),
    };


    // 7. Mint PKP
    const mintInfo = await contractClient.mintWithAuth({
      authMethod,
      scopes: [
        AuthMethodScope.NoPermissions,
        AuthMethodScope.SignAnything,
        AuthMethodScope.PersonalSign,
      ],
    });

    const authId = await LitAuthClient.getAuthIdByAuthMethod(authMethod);
    const scopes = await contractClient.pkpPermissionsContract.read.getPermittedAuthMethodScopes(
      mintInfo.pkp.tokenId,
      AuthMethodType.EthWallet,
      authId,
      3
    );

    const signAnythingScope = scopes[1];
    const personalSignScope = scopes[2];
    console.log(signAnythingScope + "---" + personalSignScope);

    const walletPKPInfo = {
      tokenId: mintInfo.pkp.tokenId,
      publicKey: `0x${mintInfo.pkp.publicKey}`,
      ethAddress: mintInfo.pkp.ethAddress,
    };

    console.log('WalletPKPInfo', walletPKPInfo);

    // 4. Mint capacity credit nft
    const { capacityTokenIdStr } = await contractClient.mintCapacityCreditsNFT({
      requestsPerKilosecond: 80,
      requestsPerDay: 14400,
      requestsPerSecond: 10,
      daysUntilUTCMidnightExpiration: 2,
    });
    console.log("capacityTokenIdStr", capacityTokenIdStr);

    // 5. Create a capacity delegation auth sig
    const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: '1',
      dAppOwnerWallet: wallet,
      capacityTokenId: capacityTokenIdStr,
      delegateeAddresses: [walletPKPInfo.ethAddress], // delegatee addresses
    });
    console.log("capacityDelegationAuthSig", capacityDelegationAuthSig);

    // // 6. Use pkp to sign a message using capacity credit
    // const pkpAuthNeededCallback = async ({
    //     expiration,
    //     resources,
    //     resourceAbilityRequests,
    //   }) => {
    //     // -- validate
    //     if (!expiration) {
    //       throw new Error('expiration is required');
    //     }

    //     if (!resources) {
    //       throw new Error('resources is required');
    //     }

    //     if (!resourceAbilityRequests) {
    //       throw new Error('resourceAbilityRequests is required');
    //     }

    //     const response = await litNodeClient.signSessionKey({
    //       statement: 'Some custom statement.',
    //       authMethods: [authMethod],  // authMethods for signing the sessionSigs
    //       pkpPublicKey: walletPKPInfo.publicKey,  // public key of the wallet which is delegated
    //       expiration: expiration,
    //       resources: resources,
    //       chainId: 1,

    //       // optional (this would use normal siwe lib, without it, it would use lit-siwe)
    //       resourceAbilityRequests: resourceAbilityRequests,
    //     });

    //     console.log('response:', response);

    //     return response.authSig;
    // };

    // const pkpSessionSigs = await litNodeClient.getSessionSigs({
    //   pkpPublicKey: walletPKPInfo.publicKey,   // public key of the wallet which is delegated
    //   expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours
    //   chain: 'ethereum',
    //   resourceAbilityRequests: [
    //     {
    //       resource: new LitPKPResource('*'),
    //       ability: LitAbility.PKPSigning,
    //     },
    //   ],
    //   authNeededCallback: pkpAuthNeededCallback,
    //   capacityDelegationAuthSig, // here is where we add the delegation to our session request
    // });
    
    // console.log("generated session with delegation ", pkpSessionSigs);

    // const res = await litNodeClient.executeJs({
    //   sessionSigs: pkpSessionSigs,
    //   code: `(async () => {
    //       const sigShare = await LitActions.signEcdsa({
    //         toSign: dataToSign,
    //         publicKey,
    //         sigName: "sig",
    //       });
    //     })();`,
    //   authMethods: [],
    //   jsParams: {     // parameters to js function above
    //     dataToSign: ethers.utils.arrayify(
    //       ethers.utils.keccak256([1, 2, 3, 4, 5])
    //     ),
    //     publicKey: walletPKPInfo.publicKey,
    //   },
    // });

    // console.log("signature result ", res);
  }

  return (
    <div className="App">
      <button onClick={withAuthSig}>Wallet With Auth Sig</button>
      <button onClick={withSessionSigs}>Wallet With Session Sigs</button>
      <button onClick={mintCapacityCredit}>Mint Capacity Credit</button>
    </div>
  );
}

