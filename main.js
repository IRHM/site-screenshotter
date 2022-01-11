import { firefox } from "playwright";
import nodemailer from "nodemailer";
import path from "path";
import chalk from "chalk";
import ENV from "./.env.js";

function log(msg, ...optionalParams) {
  const wLeadingZero = (n) => (n <= 9 ? `0${n}` : n);

  const dt = new Date();
  const date = `${wLeadingZero(dt.getDate())}/${wLeadingZero(dt.getMonth() + 1)}`;
  const time = `${wLeadingZero(dt.getHours())}:${wLeadingZero(dt.getMinutes())}:${wLeadingZero(dt.getSeconds())}`;

  console.log(`${chalk.bold.italic.dim(date, time)} ${msg}`, ...optionalParams);
}

function sleep(hours) {
  const ms = hours * 60000 * 60;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  while (true) {
    try {
      const browser = await firefox.launch({ headless: true });
      const page = await browser.newPage({
        viewport: ENV.req.viewport,
        userAgent: ENV.req.ua,
        extraHTTPHeaders: ENV.req.headers
      });

      await page.goto(ENV.site);

      // Wait for all elements required
      const form = page.locator(ENV.toScreenshot);
      await form.waitFor();

      // Select items in form dropdowns
      for (const f in ENV.form) {
        if (Object.hasOwnProperty.call(ENV.form, f)) {
          const el = ENV.form[f];

          switch (el.type) {
            case "dropdown":
              await page.selectOption(el.selector, el.value);
              break;
            case "text":
              await page.fill(el.selector, el.value);
              break;
          }
        }
      }

      // Screenshot form
      const screenshotOut = path.resolve("latest.png");
      await form.screenshot({ path: screenshotOut });

      await browser.close();

      notify(screenshotOut);
    } catch (err) {
      log("An Error Occurred!", err);
    }

    log(chalk.green.bold(`Sleeping for ${ENV.delay} hours before checking again.`));
    await sleep(ENV.delay);
  }
})();

function notify(ss) {
  const { host, port, user, pass, to, subject } = ENV.mail;

  if (!host || !port || !user || !pass || !to) {
    log(chalk.red("Mail configuration missing, skipping notify."));
    return;
  }

  let transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: true,
    auth: {
      user: user,
      pass: pass
    }
  });

  transporter.verify((err, success) => {
    if (err) log(chalk.red(`Error connecting to mail server for user ${user}: `, JSON.stringify(err)));
  });

  const ssFileName = path.basename(ss);
  const ssCid = ssFileName + "@";
  const msg = {
    from: user,
    to: to,
    subject: subject || "Site Update",
    attachments: [
      {
        path: ss,
        filename: ssFileName,
        cid: ssCid
      }
    ],
    html: `
      <h2>${subject || "Site Update"}</h2>
      <img src="cid:${ssCid}" />
    `
  };

  transporter.sendMail(msg, (err, info) => {
    if (err) {
      log(chalk.red("Error sending mail: ", err.message));
    } else {
      log(chalk.bold("Sent email", info.messageId));
    }
  });
}
