require("dotenv").config();
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const chalk = import("chalk");
const path = require("path");

function sleep(hours) {
  const ms = hours * 60000 * 60;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  while (true) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 1500 });
    await page.goto("https://www.just-eat.co.uk/courier");

    // Wait for all elements required
    const signupForm = await page.waitForSelector("#signupForm");

    // Select items in form that make vehicle menu popup
    await page.select("select[name=city_driver_operates]", process.env.CITY_TO_CHECK);
    await page.select("select[name=age_UK]", "Between 18 and 20 years old");

    // Screenshot signup form
    // signupForm.screenshot, would show a white box in image, so clipping manually instead.
    const screenshotOut = path.resolve("latest.png");
    const sfCoords = await signupForm.boundingBox();
    await page.screenshot({
      path: screenshotOut,
      clip: { x: sfCoords.x, y: sfCoords.y, width: sfCoords.width, height: sfCoords.height }
    });

    await browser.close();

    notify(screenshotOut);

    const sleepHrs = 5;
    console.log(`Sent notification, sleeping for 5 hours.`);

    await sleep(sleepHrs);
  }
})();

function notify(ss) {
  let transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  transporter.verify((err, success) => {
    if (err) console.log(chalk.red("Error connecting to mail server: ", err.message));
  });

  const ssFileName = path.basename(ss);
  const ssCid = ssFileName + "@";

  console.log(ssFileName, ssCid);

  const msg = {
    from: process.env.MAIL_USER,
    to: process.env.MAIL_TO,
    subject: process.env.MAIL_SUBJECT,
    attachments: [
      {
        path: ss,
        filename: ssFileName,
        cid: ssCid
      }
    ],
    html: `
      <h2>Latest Update On Ebike Status</h2>
      <img src="cid:${ssCid}" />
    `
  };

  transporter.sendMail(msg, (err, info) => {
    if (err) {
      console.log(chalk.red("Error sending mail: ", err.message));
    } else {
      console.log(chalk.bold("Sent email", info.messageId));
    }
  });
}
