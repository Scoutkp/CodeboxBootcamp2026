const express = require('express');
const userService = require('../services/userService');
const { OAuth2Client } = require('google-auth-library');

const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

const router = express.Router();

async function listUsers(req, res, next) {
  try { res.status(200).json(await userService.getUsers()); } catch (error) { next(error); }
}

async function getUser(req, res, next) {
  try {
    const user = await userService.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(userService.publicUser(user));
  } catch (error) { next(error); }
}

async function login(req, res, next) {
  try {
    const { username = '', password = '' } = req.body || {};
    const user = await userService.findUserByUsername(username);
    const passwordIsValid = user && await userService.verifyPassword(password, user.password_hash);
    if (!passwordIsValid) return res.status(401).json({ error: 'Invalid username or password' });
    res.status(200).json({ user: userService.publicUser(user) });
  } catch (error) { next(error); }
}

async function register(req, res, next) {
  try {
    const { username, password, passwordConfirmation } = req.body || {};
    if (!username?.trim() || !password) return res.status(400).json({ error: 'Username and password are required' });
    if (password !== passwordConfirmation) return res.status(400).json({ error: 'Passwords do not match' });
    if (await userService.findUserByUsername(username)) return res.status(409).json({ error: 'Username already exists' });
    res.status(201).json({ user: await userService.createUser(username, password) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Username already exists' });
    next(error);
  }
}

async function googleLogin(req, res, next) {
  try {
    if (!googleClient) return res.status(503).json({ error: 'Google sign-in is not configured' });
    const { credential } = req.body || {};
    if (!credential) return res.status(401).json({ error: 'Google credential is required' });

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verificationError) {
      return res.status(401).json({ error: 'Invalid Google credential' });
    }

    const payload = ticket.getPayload();
    const user = await userService.findOrCreateGoogleUser(payload);
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
}

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.post('/login', login);
router.post('/register', register);
router.post('/auth/google', googleLogin);

module.exports = router;
