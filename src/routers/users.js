const express = require('express');
const User = require('../models/user');
const auth = require('../Middleware/auth');

const router = express.Router();

// Create user
router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login user
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send('Invalid Credentials');
  }
});

// Get user data
router.get('/users/me', auth, async (req, res) => {
  res.send({ user: req.user, token: req.token });
});

// Logout user
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      token => !(token.token === req.token)
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(401).send();
  }
});

// Logout All sessions
router.post('/users/logoutALL', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

// Update user
router.patch('/users/me', auth, async (req, res) => {
  const inputs = Object.keys(req.body);
  const validInputs = ['age', 'name', 'email', 'password'];
  const valid = inputs.every(input => validInputs.includes(input));

  if (!valid) {
    return res.status(400).send({
      error: 'Invalid updates',
    });
  }
  inputs.forEach(input => (req.user[input] = req.body[input]));

  try {
    await req.user.save({ runValidators: true });
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Delete user
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
