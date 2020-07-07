const User = require("../models/user");
const jwt = require("jsonwebtoken");
const sendgridMail = require("@sendgrid/mail");
require("dotenv").config();

sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken"
      });
    }

    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: "10m" }
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Account activation link",
      html: `<h1>Please use the following link to activate your account</h1>
        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        <hr />
        <p> This email may contain sensitive information</p>
        <p>${process.env.CLIENT_URL}</p>`
    };

    sendgridMail
      .send(emailData)
      .then(sent => {
        return res.json({
          message: `Email has been sent to ${email}. Follow the instruction to activate your account.`
        });
      })
      .catch(err => {
        res.json({ message: err.message });
      });
  });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function(
      err,
      decoded
    ) {
      if (err) {
        console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
        return res.status(401).json({
          error: "The link has expired. Please re-try."
        });
      }

      const { name, email, password } = jwt.decode(token);

      const user = new User({ name, email, password });
      user.save((err, user) => {
        if (err) {
          console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR ", err);
          return res.status(401).json({
            error: "Error saving user in database. Please try again."
          });
        }

        return res.json({
          message: "Sign-up success. Please sign-in"
        });
      });
    });
  } else {
    return res.json({
      message: "Something went wrong. Please try again."
    });
  }
};
