import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
// import { User } from '../../../user/user.mdl';

export default new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  callbackURL: process.env.GOOGLE_CALLBACKURL,
},
async (token, refreshToken, profile, done) => {
  // todo add google
  console.log('GOOGLE');
  console.log('profile > ', profile);
  console.log('refreshToken > ', refreshToken);
  console.log('token > ', token);
  return done(null, false);
});
