import { google } from 'googleapis';

const OAuth2 = google.auth.OAuth2;

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  locale?: string;
}

export async function getGoogleUserProfile(
  token: string,
  clientId: string,
): Promise<GoogleUserProfile> {
  const client = new OAuth2(clientId);

  client.setCredentials({ access_token: token });
  const oauth2 = google.oauth2({
    auth: client,
    version: 'v2',
  });

  const userInfo = await oauth2.userinfo.get();

  const info: GoogleUserProfile = {
    id: userInfo.data.id,
    email: userInfo.data.email,
    name: userInfo.data.name,
    picture: userInfo.data.picture,
    locale: userInfo.data.locale,
  };

  return info;
}
