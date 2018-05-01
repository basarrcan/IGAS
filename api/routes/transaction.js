const express = require("express");
const router = express.Router();

const TransactionController = require('../controllers/transaction');
const checkAuth = require('../middleware/check-auth');

router.post("/send", TransactionController.tn_send);
router.get("/getblock/:number", TransactionController.tn_getBlock);
router.post("/create", TransactionController.tn_createSession);
router.post("/join", TransactionController.tn_joinSession);
router.post("/winner", TransactionController.tn_winner);

module.exports = router;
