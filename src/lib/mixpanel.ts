import mixpanel from 'mixpanel-browser';

mixpanel.init('51d1e9242cd717e2b7702aa3ba5a50d4');

interface UserData {
  Access: string;
  Admin: string;
  Created: string;
  ID: number;
  Koodi: string;
  "Nyt soi": string;
  Password: string;
  Päiväkoti: string;
  Updated: string;
  Username: string;
  "last used": string;
}

export const initUser = (userCode: string, userData: UserData) => {
  mixpanel.identify(userCode);
  mixpanel.people.set({
    $name: userData.Päiväkoti
  });
};

export const trackPage = (page: string, userData: UserData) => {
  mixpanel.track('page_view', {
    page,
    organization: userData.Päiväkoti
  });
};