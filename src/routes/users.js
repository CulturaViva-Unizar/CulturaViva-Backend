import passport from "passport";
import "./passport.js";

import { register } from "../controllers/users.js";
import { login } from "../controllers/auth.js";
import { getProfile } from "../controllers/users.js";

var express = require('express');
var router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', passport.authenticate('jwt', { session: false }), getProfile);

module.exports = router;
