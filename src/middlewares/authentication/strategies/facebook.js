// import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../../user/user.mdl';
import { SocialNetworkAccount, sn_display_fields } from '../../../user/sn_acc.mdl';

import knex from '../../../base';

export default new FacebookStrategy({
  // pull in our app id and secret from our auth.js file
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: process.env.FB_CALLBACK_URL,
},

// facebook will send back the token and profile
async (token, refreshToken, profile, done) => {
  console.log('profile > ', profile);
  console.log('token > ', token);
  console.log('refreshToken > ', refreshToken);
  // if (profile) return done('no profile id', false);
  const [sn_acc] = await SocialNetworkAccount.query()
    .withGraphFetched('user(authSelects)')
    .select(sn_display_fields)
    .where({ provider_id: profile.id })
    .limit(1)
    .orderBy('id')
    .catch((e) => {
      console.log('error geting user by facebook');
      done(e, null);
    });
  console.log('sn_acc > ', sn_acc);
  // if the user is found, return them
  if (sn_acc) {
    if (sn_acc.user.blocked) return done({ code: 403, message: `user is blocked, reason ${sn_acc.user.block_reason}` }, null);
    return done(null, sn_acc.user); // user found, return that user
  }
  // if the user is not found, create
  try {
    const user = await knex.transaction(async (trx) => {
      const createUser = await User.query(trx).insert({ role: 'client' })
        .returning('id', 'role');
      // set all of the facebook information in our user model
      console.log('createUser > ', createUser);

      await SocialNetworkAccount.query(trx)
        .insert({
          provider: 'facebook',
          user_id: createUser.id,
          gender: profile.gender,
          provider_id: profile.id,
          token,
          profile_url: profile.profileUrl,
          refresh_token: refreshToken,
          display_name: profile.displayName,
          given_name: JSON.stringify(profile.name),
        }).returning('*');
      const result = await User.query(trx)
        .modify('authSelects')
        .where({ id: createUser.id })
        .limit(1)
        .orderBy('id')
        .catch((e) => {
          console.log('error geting user by facebook');
          done(e, null);
        });
      return result;
    });
    if (!user) return done(null, false);
    return done(null, user);
  } catch (e) {
    return done(e, false);
  }
});
