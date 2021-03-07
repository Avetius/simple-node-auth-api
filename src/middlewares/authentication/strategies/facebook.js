// import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Users } from '../../../auth/auth.mdl';

// =========================================================================
// FACEBOOK ================================================================
// =========================================================================
export default new FacebookStrategy({
  // pull in our app id and secret from our auth.js file
  clientID: process.env.FB_CLIENTID,
  clientSecret: process.env.FB_CLIENTSECRET,
  callbackURL: process.env.FB_CALLBACKURL,
},
// facebook will send back the token and profile
(token, refreshToken, profile, done) => {
  // asynchronous
  process.nextTick(() => {
    // find the user in the database based on their facebook id
    Users.findOne({
      where: { facebookId: profile.id },
    }).then((user) => {
      // if the user is found, then log them in
      if (user) {
        done(null, user); // user found, return that user
      } else {
        // if there is no user found with that facebook id, create them
        const newUser = Users.build({
          facebookID: profile.id, // set the users facebook id
          facebookToken: profile.token, // we will save the token that facebook provides to the user
          facebookName: `${profile.name.givenName} ${profile.name.familyName}`, // look at the passport user profile to see how names are returned
          facebookEmail: profile.emails[0].value, // facebook can return multiple emails so we'll take the first
        });
        // set all of the facebook information in our user model

        // save our user to the database
        Users.create(newUser)
          .then((u) => {
            done(null, u);
          })
          .catch((err) => {
            done(err, null);
          });
        // if successful, return the new user
      }
    }).catch((err) => {
      done({
        message: 'Sign up failed',
        err,
        status: 401,
        user: null,
      });
    });
  });
});
