import google from 'google';

export default function (options) {
  if (!google) {
    throw new Error('This library depends on the Google Maps API');
  }
}
