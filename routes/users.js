const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const { User } = require("../models");

const router = express.Router();
router.use(express.json());







module.exports = router;