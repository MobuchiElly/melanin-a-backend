const express = require("express");
const subscribe = require("../controllers/subscription");

const router = express.Router();

router.post("/subscribe", subscribe);

module.exports = router;