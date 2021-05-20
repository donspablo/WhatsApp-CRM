"use strict";
const express = require("express");
const router = express.Router();
const {MessageRouter} = require('./messages/routes/message.router');
const {UserRouter} = require('./users/routes/users.router');
const {PaymentRouter} = require('./payments/routes/payments.router');


router.use('/message', MessageRouter);
router.use('/users', UserRouter);
router.use('/payments', PaymentRouter);


router.get('/', (req, res) => {
    res.send('v0')
});

router.post('/', (req, res) => {
    res.send('v0')
});

exports.IndexRouter = router;
