// import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { User } from '../../../user/user.mdl';
import { SocialNetworkAccount } from '../../../user/sn_acc.mdl';
import knex from '../../../base';

export default new FacebookStrategy({
  // pull in our app id and secret from our auth.js file
  clientID: process.env.FB_CLIENT_ID,
  clientSecret: process.env.FB_CLIENT_SECRET,
  callbackURL: process.env.FB_CALLBACK_URL,
},

// facebook will send back the token and profile
async (token, refreshToken, profile, done) => {
  console.log('FACEBOOK');
  console.log('profile > ', profile);
  console.log('token > ', token);
  const [sn_acc] = await SocialNetworkAccount.query()
    .withGraphFetched('user')
    .modifyGraph('user', (builder) => {
      builder
        .select('id', 'role', 'blocked', 'block_reason', 'avatar', 'background', 'created_at', 'updated_at', 'deleted_at')
        .orderBy('id')
        .withGraphFetched('login', (loginBuilder) => {
          loginBuilder.select('email', 'login', 'verified_email');
        })
        .withGraphFetched('phones', (phoneBuilder) => {
          phoneBuilder.select('country_code', 'number', 'verified_phone');
        })
        .withGraphFetched('client_profile', (clientBuilder) => {
          clientBuilder.select('firstname', 'lastname', 'prefix', 'dob', 'avatar', 'background');
        })
        .withGraphFetched('partner_profile', (partnerBuilder) => {
          partnerBuilder.select('companyname', 'address1', 'address2', 'phone', 'logo', 'background');
        })
        .withGraphFetched('social_networks', (loginBuilder) => {
          loginBuilder.select('provider', 'provider_id', 'profile_url', 'display_name', 'gender', 'emails', 'photos', 'family_name', 'given_name', 'middle_name');
        });
    })
    .select('provider', 'provider_id', 'profile_url', 'display_name', 'gender', 'emails', 'photos', 'family_name', 'given_name', 'middle_name')
    .where({ provider_id: profile.id })
    .limit(1)
    .orderBy('id')
    .catch((e) => {
      console.log('error geting user by facebook');
      done(e, null);
    });
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
      await SocialNetworkAccount.query(trx)
        .insert({
          provider: 'facebook',
          user_id: createUser.id,
          gender: profile.gender,
          provider_id: profile.id,
          token,
          profile_url: profile.profileUrl,
          refresh_token: profile.refreshToken,
          display_name: profile.displayName,
          given_name: JSON.stringify(profile.name),
        }).returning('*');
      const result = await User.query(trx)
        .select('id', 'role', 'blocked', 'block_reason', 'avatar', 'background', 'created_at', 'updated_at', 'deleted_at')
        .withGraphFetched('login', (loginBuilder) => {
          loginBuilder.select('email', 'login', 'verified_email');
        })
        .withGraphFetched('phones', (phoneBuilder) => {
          phoneBuilder.select('country_code', 'number', 'verified_phone');
        })
        .withGraphFetched('client_profile', (clientBuilder) => {
          clientBuilder.select('firstname', 'lastname', 'prefix', 'dob', 'avatar', 'background');
        })
        .withGraphFetched('partner_profile', (partnerBuilder) => {
          partnerBuilder.select('companyname', 'address1', 'address2', 'phone', 'logo', 'background');
        })
        .withGraphFetched('social_networks', (loginBuilder) => {
          loginBuilder.select('provider', 'provider_id', 'profile_url', 'display_name', 'gender', 'emails', 'photos', 'family_name', 'given_name', 'middle_name');
        })
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

// profile >  {
//   id: '2856974674574151',
//   username: undefined,
//   displayName: 'Avet Sargsyan',
//   name: {
//     familyName: undefined,
//     givenName: undefined,
//     middleName: undefined
//   },
//   gender: undefined,
//   profileUrl: undefined,
//   provider: 'facebook',
//   _raw: '{"name":"Avet Sargsyan","id":"2856974674574151"}',
//   _json: { name: 'Avet Sargsyan', id: '2856974674574151' }
// }
// refreshToken >  undefined
// token >  EAAdlHi3Ks5IBACxEEXfma4fzv6DuqHx2wjZCJpWRtT568moPUTYJmb5kDCe9q7jtZAGxpcc3h5fkcMEdZB5fr6jLIqTZAwYJ0KuMHbK0iUvtufR6rtXk1HdZAZAHDWV7AV16p4mGOUwXPVHPBIcVAevi7COPcF9GOyc26zOCvB6NfZB0TysIjuT
