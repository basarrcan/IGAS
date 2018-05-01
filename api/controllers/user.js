const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

const Eos = require('eosjs');
const ecc = require('eosjs-ecc');

const User = require("../models/user");

exports.user_register = (req, res, next) => {
  console.log("register sent");
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        console.log("email valid");
        User.find({ username: req.body.username })
          .exec()
          .then(user => {
            if (user.length >= 1) {
              return res.status(409).json({
                message: "Username exists"
              });
            } else {

              ecc.randomKey().then(privateKey => {
                const publicKey = ecc.privateToPublic(privateKey);
                const keyProvider = ['5JbfjFuet39xyWU8FaAEnssKQLCCgT7V6uxFz2jEzQ2nDr2Giz8'];
                const eos = Eos.Localnet({keyProvider});
                eos.newaccount({
                  creator: 'igastoken',
                  name: req.body.username,
                  owner: publicKey,
                  active: publicKey,
                  recovery: 'igastoken'
                }).then(() => {
                  eos.contract('igastoken').then(igastoken => {
                    // Transfer is one of the actions in currency.abi
                    igastoken.transfer("igastoken", req.body.username, "0.0001 IGT", "");
                  });
                  const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    email: req.body.email,
                    username: req.body.username,
                    address: publicKey
                  });
                  user
                    .save()
                    .then(result => {
                      console.log(result + "private key: " + privateKey);
                      return res.status(201).json({
                        success: true,
                        privateKey: privateKey,
                        message: "User successfully created!!  privateKey = " + privateKey + "  publicKey: " + publicKey
                      });
                    })
                    .catch(err => {
                      console.log(err);
                      return res.status(500).json({
                        error: err
                      });
                    });
                }).catch(err => {
                  console.log(err);
                  return res.status(500).json({
                    error:err
                  });
                });
              }).catch(err => {
                console.log(err);
                return res.status(500).json({
                  error:err
                });
              });


            }
          }).catch(err => {
            console.log(err);
            return res.status(500).json({
              error:err
            });
          });
      }
    });
};

exports.user_login = (req, res, next) => {
  User.find({ username: req.body.username })
    .exec()
    .then(user => {
      console.log("tries");
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      console.log("tries");
      const address = ecc.privateToPublic(req.body.privateKey);
      console.log("tries");
      console.log(user[0].address + "  address: " + address);
      if (address == user[0].address) {
        console.log("tries");

        const token = jwt.sign(
          {
            email: user[0].email,
            userId: user[0]._id,
            address: user[0].address
          },
          process.env.JWT_KEY,
          {
            expiresIn: "1h"
          }
        );
        return res.status(201).json({
          success: true,
          message: "Auth successful",
          token: token,
          user: user[0]
        });
      }
      res.status(401).json({
        message: "Auth failed " + address + "     " + user[0].address
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.user_profile = (req, res, next) => {
  User.find({ username: req.params.username })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        });
      }
      const keyprovider = [];
      const eos = Eos.Localnet({keyprovider});
      const gettableoptions = {
        json: true,
        table_key: "IGT",
        scope: req.params.username,
        code: "igastoken",
        table: "accounts"
      }
      eos.getCurrencyBalance("eosio.token", req.params.username, "EOS").then(
        eosbalance => {
          eos.getTableRows(gettableoptions).then(results => {
            const userDetails = {
              username: user[0].username,
              email: user[0].email,
              address: user[0].address,
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
              error: err
            });
          });
        }).catch(err => {
          console.log(err);
          res.status(500).json({
            error: err
          });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

