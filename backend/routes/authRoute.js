require('dotenv').config();
const passport = require('passport');
const router = require('express').Router();
const google = require('googleapis').google;
const OAuth2 = google.auth.OAuth2;
const CONFIG = require('../services/config');
const MasterUser = require('../models/masterUser.model');
const nodemailer = require('nodemailer');
const path = require('path');
const ejs = require('ejs');
const client = require('../API/waMailer');
const bcrypt = require('bcryptjs');

// custom functions
function randomIntInc(low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low)
}

// check existing user middleware
const userExistCheck = (req, res, next) => {
    try {
        MasterUser.findOne({ username: req.body.username })
            .then((doc) => {
                if (doc) {
                    if (req.body.actionCode === 0) {
                        //register action
                        res.json({ error: 'User sudah pernah dibuat' }).end();
                    }
                    else {
                        //login action
                        next();
                    }
                }
                else {
                    next();
                }
            })
            .catch(err => res.status(400).json({ error: 'Error: ' + err }));
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
};

// auth verification
router.post('/verification', userExistCheck, (req, res) => {
    try {
        let { email, phone, username } = req.body;

        let verificationCode = '';
        for (var i = 0; i < 6; i++) {
            verificationCode += randomIntInc(1, 9).toString();
        }

        if (email !== '') {
            req.session.tempVrfCode = verificationCode;
            let emailTemplate;

            ejs.renderFile(path.join(__dirname, '../emailTemplate/emailVerificationTemplate.ejs'),
                {
                    username: username,
                    verificationCode: verificationCode.toString(),
                    copyrightDate: new Date().getFullYear().toString()
                })
                .then(result => {
                    emailTemplate = result;

                    let transport = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        auth: {
                            user: "tissymobile@gmail.com",
                            pass: "arisajah123"
                        }
                    });

                    const message = {
                        from: 'tissymobile@gmail.com',
                        to: email,
                        subject: 'Verifikasi Akun Yang Anda Daftarkan',
                        html: emailTemplate
                    };
                    transport.sendMail(message, function (err, info) {
                        if (err) {
                            console.log(err);
                            res.json({ error: err.message });
                        } else {
                            res.json({ message: info });
                        }
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.status(400).json({
                        error: 'Error Rendering emailTemplate' + err.message
                    });
                });
        }
        else {
            //format phone number to whatsapp format
            req.session.tempVrfCode = verificationCode;
            let phoneStr = phone.substring(1, phone.length);
            if (phone.includes('+62')) {
                client.sendMessage(phoneStr.toString() + '@c.us', 'Kode verifikasi anda : ' + verificationCode);
            }
            else {
                client.sendMessage('62' + phoneStr.toString() + '@c.us', 'Kode verifikasi anda : ' + verificationCode);
            }

            res.json({ message: 'ok' }).end();
        }
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
});

// auth logout
router.get('/logout', (req, res) => {
    try {
        req.logout();
        res.json({ message: 'Berhasil Keluar' });
    }
    catch (err) {
        res.json({ error: 'Error: ' + err.message });
    }
});

// internal auth
router.route('/register').post(async (req, res) => {
    try {
        let { user, verificationCode } = req.body;

        if (verificationCode === req.session.tempVrfCode) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            const newUser = new MasterUser({
                username: user.username,
                password: hashedPassword,
                displayName: user.username,
                email: user.email,
                phone: user.phone,
                age: -1,
                externalProvider: 0,
                RoleId: 0,
                isDelete: false
            });

            await newUser.save();

            req.session.destroy();
            res.json({ message: 'Registrasi sukses' });
        }
        else {
            res.json({ error: 'Kode verifikasi salah' });
        }
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
});

router.post('/login', userExistCheck, function (req, res, next) {
    try {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                console.log(err);
                res.json({ error: 'Error: ' + res.message });
            }
            if (!user) {
                res.json({ error: 'User tidak ditemukan atau password salah' });
            }
            else {
                req.logIn(user, err => {
                    if (err) {
                        console.log(err);
                        res.json({ error: 'Error: ' + res.message });
                    }
                    else {
                        res.json({ message: 'Berhasil masuk' });
                    }
                })
            }
        })(req, res, next);
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
});

// external auth
//Google
router.get('/google', function (req, res) {
    try {
        const oauth2Client = new OAuth2(CONFIG.oauth2Credentials.client_id, CONFIG.oauth2Credentials.client_secret, CONFIG.oauth2Credentials.redirect_uris[0]);
        const loginLink = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: CONFIG.oauth2Credentials.scopes
        });
        return res.send(loginLink);
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
});

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    try {
        res.redirect(process.env.FRONTEND_URL + process.env.FRONTEND_PORT + '/');
    }
    catch (err) {
        console.log(err);
        res.json({ error: 'Error: ' + err.message });
    }
});

//Facebook
router.get('/facebook', passport.authenticate('facebook'));

// callback route for facebook to redirect to
router.get('/facebook/redirect',
    passport.authenticate('facebook', {
        successRedirect: process.env.FRONTEND_URL + process.env.FRONTEND_PORT + '/',
        failureRedirect: process.env.FRONTEND_URL + process.env.FRONTEND_PORT + '/login'
    }));

module.exports = router;