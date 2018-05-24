const express = require("express");
const router = express.Router();

const TransactionController = require('../controllers/transaction');

router.post("/send", TransactionController.tn_send);
router.post("/create", TransactionController.tn_createSession);
router.post("/join", TransactionController.tn_joinSession);
router.post("/winner", TransactionController.tn_winner);
router.post("/register", TransactionController.user_register);
router.post("/login", TransactionController.user_login);
router.get("/profile/:username", TransactionController.user_profile);

module.exports = router;
