const crypto = require("crypto");

// Global Variables
const merchantId = "385094";
// "140157";
//
const encryptionKey = "3869683050905603";
//"1400011601505020";
//
const subMerchantId = "25";
//45
const paymode = "9";
//9

const returnUrl = "https://api.farm2kitchen.co.in/payment-response";
const DEFAULT_BASE_URL = "https://eazypayuat.icicibank.com/EazyPG?";

function getPaymentUrl(amount, referenceNo, optionalField = null) {
  const mandatoryField = getMandatoryField(amount, referenceNo);
  const optionalFieldValue = getOptionalField(optionalField);
  const encryptedAmount = getAmount(amount);
  const encryptedReferenceNo = getReferenceNo(referenceNo);

  return generatePaymentUrl(
    mandatoryField,
    optionalFieldValue,
    encryptedAmount,
    encryptedReferenceNo
  );
}

function generatePaymentUrl(
  mandatoryField,
  optionalField,
  amount,
  referenceNo
) {
  const encryptedUrl =
    `${DEFAULT_BASE_URL}merchantid=${merchantId}` +
    `&mandatory fields=${mandatoryField}` +
    `&optional fields=${optionalField}` +
    `&returnurl=${getReturnUrl()}` +
    `&Reference No=${referenceNo}` + //
    `&submerchantid=${getSubMerchantId()}` +
    `&transaction amount=${amount}` +
    `&paymode=${getPaymode()}`;
  // reference nodemon,trnction,paymnet mode ,date and time,
  // console.log(encryptedUrl);

  return encryptedUrl;
}

function getMandatoryField(amount, referenceNo) {
  return getEncryptValue(`${referenceNo}|${subMerchantId}|${amount}`);
}

function getOptionalField(optionalField = null) {
  if (optionalField !== null) {
    return getEncryptValue(optionalField);
  }
  return null;
}

function getAmount(amount) {
  return getEncryptValue(amount.toString()); // Convert to string
}

function getReturnUrl() {
  return getEncryptValue(returnUrl);
}

function getReferenceNo(referenceNo) {
  return getEncryptValue(referenceNo.toString()); // Convert to string
}

function getSubMerchantId() {
  return getEncryptValue(subMerchantId);
}

function getPaymode() {
  return getEncryptValue(paymode);
}

function getEncryptValue(data) {
  const cipher = crypto.createCipheriv(
    "aes-128-ecb",
    Buffer.from(encryptionKey, "utf8"),
    null
  );
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

// Generate a random 6-digit number
// let randomSixDigitNumber = Math.floor(100000 + Math.random() * 900000);
// console.log(randomSixDigitNumber);

// const url = getPaymentUrl(10, "8963728");
// console.log(url);

module.exports = { getPaymentUrl };

// const express = require('express');
// const bodyParser = require('body-parser');
// const cookieParser = require('cookie-parser');

// const app = express();
// const port = 3000;

// // Middleware to parse request body
// app.use(bodyParser.urlencoded({ extended: true })); // for form data (application/x-www-form-urlencoded)
// app.use(bodyParser.json()); // for JSON data
// app.use(cookieParser()); // to parse cookies

// app.post('/your-endpoint', (req, res) => {
//     // Access all request data similarly to PHP's $_REQUEST
//     const allRequestData = {
//         ...req.query,  // Get parameters from the query string (equivalent to $_GET)
//         ...req.body,   // Get data from the request body (equivalent to $_POST)
//         ...req.cookies // Get data from cookies (equivalent to $_COOKIE)
//     };

//     // Print all request data
//     console.log("Request Data: ", allRequestData);

//     // Send a response back to the client
//     res.json(allRequestData);
// });

// app.listen(port, () => {
// console.log(`Server running at http://localhost:${port}`);
// });
