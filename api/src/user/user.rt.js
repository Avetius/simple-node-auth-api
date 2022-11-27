import express from 'express';
import { pass, permit } from '../middlewares/authentication';
import { validate } from '../middlewares/validation';
import {
  signup, login, changePassword, forgotPassword, recoverPassword, blockUser, list, update_body, params_id,
} from '../validators/users';
import User from './user.ctl';

const router = express.Router();

export default router
  .post('/login', validate(login, 'body'), pass.authenticate('local', { session: false }), User.login)
  .post('/signup', validate(signup, 'body'), User.signup)
  .get('/auth/facebook', pass.authenticate('facebook', { session: false }))
  .get('/auth/facebook/callback', pass.authenticate('facebook', { session: false }), User.facebookCB)
  .get('/verify_email/:token', validate(recoverPassword, 'params'), User.verify_email)
  .post('/recoverPassword/:token', validate(recoverPassword, 'params'), User.recoverPassword)
  .post('/forgotPassword', validate(forgotPassword, 'body'), User.forgotPassword)
  .post('/changePasswordEmail', pass.authenticate('jwt', { session: false }), User.changePasswordEmail)
  .post('/changePassword/:token', validate(changePassword, 'body'), pass.authenticate('jwt', { session: false }), User.changePassword)
  .post('/blockUser', validate(blockUser, 'body'), pass.authenticate('jwt', { session: false }), permit('superadmin', 'admin'), User.blockUser)
  .post('/blockAdmin', validate(blockUser, 'body'), pass.authenticate('jwt', { session: false }), permit('superadmin'), User.blockAdmin)
  .get('/list', validate(list, 'query'), pass.authenticate('jwt', { session: false }), permit('superadmin', 'admin'), User.list)
  .put('/update/:id', validate(update_body, 'body'), validate(params_id, 'params'), pass.authenticate('jwt', { session: false }), permit('superadmin', 'admin'), User.update)
  .delete('/delete/:id', validate(params_id, 'params'), pass.authenticate('jwt', { session: false }), permit('superadmin', 'admin'), User.delete);
