import mixpanel, { Dict } from 'mixpanel-browser';

mixpanel.init('51d1e9242cd717e2b7702aa3ba5a50d4');    

export const trackEvent = (name: string, props?: Dict) => {
    mixpanel.track(name, props);
  };