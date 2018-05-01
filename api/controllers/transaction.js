const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Eos = require('eosjs');

const User = require("../models/user");

exports.tn_send = (req, res, next) => {
  const sender = req.body.sender;
  const receiver = req.body.receiver;
  const amount = req.body.amount;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({keyProvider});
  eos.contract('igastoken').then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.transfer(sender, receiver, amount, '',{authorization: sender}).then(result => {
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
;
  // eos.getAccount(reciever).then(
  //   results => {
  //     res.status(201).json({
  //       message: results
  //     });
  //   });
};

exports.tn_createSession = (req, res, next) => {
  const host = req.body.host;
  const quantity = req.body.quantity;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({keyProvider});
  eos.contract('igastoken').then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.createsess(host, quantity, session,{authorization: host});
  }).then(result =>{
      console.log("Session created, id: " + session);
        return res.status(201).json({
          message:"Session created, id: " + session
        });
    });
};

exports.tn_joinSession = (req, res, next) => {
  const player = req.body.player;
  const quantity = req.body.quantity;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({keyProvider});
  eos.contract('igastoken').then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.joinsess(player, quantity, session,{authorization: player});
  }).then(result =>{
      console.log("Player " + player + " joined into the session: " + session + "with " + quantity);
        return res.status(201).json({
          message:"Player " + player + " joined into the session: " + session + "with " + quantity
        });
    });
};

exports.tn_winner = (req, res, next) => {
  const host = req.body.host;
  const winner = req.body.winner;
  const percentage = req.body.percentage;
  const session = req.body.session;
  const keyProvider = [req.body.privateKey];
  const eos = Eos.Localnet({keyProvider});
  eos.contract('igastoken').then(igastoken => {
    // Transfer is one of the actions in currency.abi
    igastoken.winner(host, winner, percentage, session, {authorization: host});
  }).then(result =>{
      console.log("Winner of the session " + session + "i s " + winner + " !");
        return res.status(201).json({
          message:"Winner of the session " + session + " is " + winner + " !"
        });
    });
};
// eos.getAccount(reciever).then(
//   results => {res.status(201).json({
//   message: results
//   });
// });
// eos.contract('currency').then(currency => {
//   // Transfer is one of the actions in currency.abi
//   currency.get_balance(reciever).then( results => {
//     res.status(201).json({
//       message: results
//     });
//   });
// });
exports.tn_getBlock = (req, res, next) => {
  const keyProvider = [];
  const eos = Eos.Localnet({keyProvider});
  eos.getBlock(req.params.number).then(result => {
    res.status(201).json({
      message: "Successfully send!",
      results: result
    });
  });
};
