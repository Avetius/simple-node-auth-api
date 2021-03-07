import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Users } from '../../../auth/auth.mdl';

export default new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENTID,
  clientSecret: process.env.GOOGLE_CLIENTSECRET,
  callbackURL: process.env.GOOGLE_CALLBACKURL,
},
(token, refreshToken, profile, done) => {
  // make the code asynchronous
  // User.findOne won't fire until we have all our data back from Google
  process.nextTick(() => {
    // try to find the user based on their google id
    Users.findOne({
      where: { googleId: profile.id },
    }).then((user) => {
      if (user) {
        // if a user is found, log them in
        done(null, user);
      } else {
        // if the user isnt in our database, create a new user
        const newUser = Users.build({
          googleId: profile.id,
          googleToken: token,
          googleName: profile.displayName,
          googleEmail: profile.emails[0].value, // pull the first email
        });
        // save the user
        Users.create(newUser)
          .then((u) => {
            done(null, u);
          })
          .catch((err) => {
            done(err, null);
          });
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
