import { AuthMethodScope, ProviderType } from '@lit-protocol/constants';
import { LitAuthClient, isSignInRedirect } from '@lit-protocol/lit-auth-client';
import { useEffect } from 'react';

export function MintPKPViaSocial() {
  const relayApiKey = process.env.REACT_APP_RELAY_API_KEY; // Get one by filling this form: https://forms.gle/RNZYtGYTY9BcD9MEA
  const redirectUri = 'http://localhost:3000';

  // After the user signs in with their Google account they will be redirected to the `redirectUri` and we're handling the authentication and redirect logic below
  useEffect(() => {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey,
      },
    });
    litAuthClient.initProvider(ProviderType.Google, {
      redirectUri,
    });

    (async () => {
      // Checks if app has been redirected from Lit login server: https://js-sdk.litprotocol.com/functions/lit_auth_client_src.isSignInRedirect.html
      if (isSignInRedirect(redirectUri)) {
        const provider = litAuthClient.getProvider(
          ProviderType.Google,
        );

        // Get auth method object that has the OAuth token from redirect callback
        const authMethod = await provider.authenticate();
        console.log(authMethod);

        const options = {
          permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]], // Learn more about the scopes here: https://developer.litprotocol.com/v3/sdk/wallets/auth-methods/#auth-method-scopes
        };
        const mintTx = await provider.mintPKPThroughRelayer(
          authMethod,
          options
        );
        console.log(mintTx);

        const pkps = await provider.fetchPKPsThroughRelayer(authMethod);
        console.log(pkps);

        const sessionSigs = await provider.getSessionSigs({
          authMethod,
          sessionSigsParams: {
            chain: 'ethereum',
            resourceAbilityRequests: [ // You may add the resources associated with the sessionSig as capabilities here: https://developer.litprotocol.com/v3/sdk/authentication/session-sigs/intro/#signed-message
              // {
              //   resource: litResource,
              //   ability: LitAbility.AccessControlConditionDecryption
              // }
            ],
          },
          pkpPublicKey: pkps[0].publicKey, // Note, an AuthMethod can own more than one PKP
        });
        console.log(sessionSigs);

        const litActionCode = `
          const go = async () => {
            console.log(Lit.Auth);
            const sigShare = await Lit.Actions.signEcdsa({ toSign, publicKey, sigName });
          };
          go();
        `;

        const signatures = await provider.litNodeClient.executeJs({
          code: litActionCode,
          sessionSigs,
          authMethods: [authMethod],
          jsParams: {
            toSign: [84, 104, 105, 115, 32, 109, 101, 115, 115, 97, 103, 101, 32, 105, 115, 32, 101, 120, 97, 99, 116, 108, 121, 32, 51, 50, 32, 98, 121, 116, 101, 115],
            publicKey: pkps[0].publicKey,
            sigName: "sig1",
          },
        });

        console.log("signatures: ", signatures);
      }
    })();
  }, []);

  // This will direct the user to the Lit Server Login page where the user will be prompted to signin with their Google Account
  const authenticateWithGoogleJWT = async () => {
    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey,
      },
    });
    litAuthClient.initProvider(ProviderType.Google, {
      redirectUri,
    });

    // Begin login flow with Google
    (async () => {
      const provider = litAuthClient.getProvider(
        ProviderType.Google
      );
      await provider.signIn();
    })();
  }

  return (
    <>
      <button onClick={authenticateWithGoogleJWT}>
      {/* <button> */}
        Mint with Google JWT
      </button>
    </>
  );
}