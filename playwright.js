import dotenv from "dotenv";
import { firefox } from "playwright";
import nodemailer from "nodemailer";
import path from "path";
import chalk from "chalk";

function sleep(hours) {
  const ms = hours * 60000 * 60;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  dotenv.config();

  while (true) {
    const sleepHrs = 5;

    try {
      const browser = await firefox.launch({ headless: true });
      const page = await browser.newPage({
        viewport: {
          width: 1280,
          height: 1500
        },
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36"
      });

      await page.goto("https://www.just-eat.co.uk/courier");

      // Wait for all elements required
      const signupForm = page.locator("#signupForm");
      await signupForm.waitFor();

      // Select items in form that make vehicle menu popup
      await page.selectOption("select[name=city_driver_operates]", process.env.CITY_TO_CHECK);
      await page.selectOption("select[name=age_UK]", "Between 18 and 20 years old");

      // Screenshot signup form
      const screenshotOut = path.resolve("latest.png");
      await signupForm.screenshot({ path: screenshotOut });

      await browser.close();

      notify(screenshotOut);

      console.log(chalk.green.bold(`Sending notification, sleeping for ${sleepHrs} hours...`));
    } catch (err) {
      console.log("An Error Occurred!", err);
    }

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
    if (err)
      console.log(
        chalk.red(`Error connecting to mail server for user ${process.env.MAIL_USER}: `, JSON.stringify(err))
      );
  });

  const ssFileName = path.basename(ss);
  const ssCid = ssFileName + "@";
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
