import { PublicClientApplication } from '@azure/msal-browser';

const msalConfig = {
  auth: {
    clientId: '8cfd92a6-c746-41b4-8147-8306ee212422', // Replace with your Azure AD app client ID
    authority: 'https://login.microsoftonline.com/6ed00531-fdfc-4ce8-9579-44bf37b0ecc4', // Replace with your tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);