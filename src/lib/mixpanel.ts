import mixpanel from 'mixpanel-browser';

type UserData = {
  Päiväkoti: string;
};

export const initUser = (userCode: string, userData: UserData) => {
  mixpanel.identify(userCode);
  mixpanel.people.set({ $name: userData.Päiväkoti });
};

export const trackPage = (page: string, userData: UserData) => {
  mixpanel.track('page_view', {
    page,
    organization: userData.Päiväkoti 
  });
};