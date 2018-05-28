const bcrypt = require("bcrypt");
const Eos = require('eosjs');
const ecc = require('eosjs-ecc');
const dotenv = require('dotenv');

exports.tn_send = (req, res, next) => {
  const sender = req.body.sender;
  const receiver = req.body.receiver;
  const amount = req.body.amount;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({ keyProvider });
  eos.contract(process.env.CURRENCY_CONTRACT_NAME).then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.transfer(sender, receiver, amount, '', { authorization: sender }).then(result => {
      return res.status(201).json({
        success: true,
        message: "Transfer completed!"
      });
    }).catch(err => {
      return res.status(201).json({
        success: false,
        message: "Something went wrong, please check your inputs."
      });
    });
  });
};

exports.user_register = (req, res, next) => {

  ecc.randomKey().then(privateKey => {
    const publicKey = ecc.privateToPublic(privateKey);
    //const keyProvider = [process.env.PRIVATE_KEY];
    const eos = Eos.Localnet({keyProvider: process.env.PRIVATE_KEY});
    console.log("ERROR IS");
    eos.newaccount({
      creator: process.env.CURRENCY_CONTRACT_NAME,
      name: req.body.username,
      owner: publicKey.toString(),
      active: publicKey.toString(),
      recovery: process.env.CURRENCY_CONTRACT_NAME
    }).then(() => {
      eos.contract(process.env.CURRENCY_CONTRACT_NAME).then(igastoken => {
        console.log("transfer");
        return res.status(200).json({
          success: true,
          username: req.body.username,
          privateKey: privateKey
        });
      }).catch(err => {
        console.log(err);
        return res.status(500).json({
          error: err
        });
      });
    }).catch(err => {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err
    });
  });
};

exports.user_login = (req, res, next) => {
  const address = ecc.privateToPublic(req.body.privateKey);
  const eos = Eos.Localnet();

  eos.getAccount(req.body.username).then(result => {
    if (result.permissions[0].required_auth.keys[0].key = ecc.privateToPublic(req.body.privateKey)) {
      console.log(result);
      return res.status(201).json({
        success: true,
        message: "Auth successful",
      });
    } else if (result.permissions[1].required_auth.keys[0].key == ecc.privateToPublic(req.body.privateKey)) {
      console.log(result);
      return res.status(201).json({
        success: true,
        message: "Auth successful"
      });
    } else {
      console.log(result);
      return res.status(400).json({
        success: false,
        message: "Wrong credentials"
      });
    }
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      error: err
    });
  });
};

exports.user_profile = (req, res, next) => {

  const eos = Eos.Localnet();
  const gettableoptions = {
    json: true,
    table_key: "IGS",
    scope: req.params.username,
    code: process.env.CURRENCY_CONTRACT_NAME,
    table: "accounts"
  }
  eos.getCurrencyBalance("eosio.token", req.params.username, "EOS").then(
    eosbalance => {
      eos.getTableRows(gettableoptions).then(results => {
        const userDetails = {
          balance: results.rows[0].balance,
          eosBalance: eosbalance[0]
        }
        console.log(results.rows);
        res.status(201).json({
          success: true,
          user: userDetails
        });
      }).catch(err => {
        console.log(err);
        res.status(500).json({
          error: err,
          message: "User hasnt registered to IGAS platform"
        });
      });
    }).catch(err => {
      console.log(err);
      res.status(500).json({
        error: err,
        message: "currencybalance error"
      });
    });
};

exports.tn_createSession = (req, res, next) => {
  const host = req.body.host;
  const quantity = req.body.quantity;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({ keyProvider });
  eos.contract(process.env.CURRENCY_CONTRACT_NAME).then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.createsess(host, quantity, session, { authorization: host });
  }).then(result => {
    console.log("Session created, id: " + session);
    console.log("results: " + result);
      return res.status(201).json({
        message: "Session created, id: " + session
      });
  }).catch(err => {
    console.log("err2");
    return res.status(400).json({
      message: "Session creation failed!"
    });
  });
};

exports.tn_joinSession = (req, res, next) => {
  const player = req.body.player;
  const quantity = req.body.quantity;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({ keyProvider });
  eos.contract(process.env.CURRENCY_CONTRACT_NAME).then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.joinsess(player, quantity, session, { authorization: player });
  }).then(result => {
    console.log("Player " + player + " joined into the session: " + session + "with " + quantity);
    console.log(result);
    return res.status(201).json({
      message: "Player " + player + " joined into the session: " + session + "with " + quantity
    });
  }).catch(err => {
    console.log(err);
    return res.status(500).json({
      message: err
    });
  });
};

exports.tn_winner = (req, res, next) => {
  const host = req.body.host;
  const winner = req.body.winner;
  const percentage = req.body.percentage;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({ keyProvider });
  eos.contract(process.env.CURRENCY_CONTRACT_NAME).then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.winner(host, winner, percentage, session, { authorization: host });
  }).then(result => {
    console.log("Winner of the session " + session + "is " + winner + " !");
    return res.status(201).json({
      message: "Winner of the session " + session + " is " + winner + " !"
    });
  });
};
