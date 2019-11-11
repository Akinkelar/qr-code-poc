const express = require('express');
const localMiddleware = require('./login/middleware');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

module.exports.init = (app, passport) => {
  // cookie parser
  app.use(cookieParser());

  // JSON body post requests
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  // file upload
  app.use(express.static('uploads'));

  // passport.js middleware
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  localMiddleware.localStrategyMiddleware(passport);

  // app.use(function(err, req, res, next) {
  //   console.log('WENT TO MIDDLEWARE AFTER DONE!!!')
  //   if (err) {
  //     res.status(403).json({ error: 'wrong credentials' });
  //     return;
  //   }
  // });
};
