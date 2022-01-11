const ENV = {
  // URL to site to check
  site: "",

  // ID for element on the page to screenshot
  toScreenshot: "#theFormIWantToScreenshot",

  // Time to wait before checking site again in HOURS.
  delay: 5,

  // Request properties
  req: {
    // Browser viewport
    viewport: {
      width: 1280,
      height: 1500
    },

    // User agent to use
    ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36",

    // Extra headers to apply (eg, Cookie)
    headers: {}
  },

  // Items of a form that may need to be filled out
  form: [],

  // To get notified through mail
  mail: {
    host: "",
    port: 465,
    user: "",
    pass: "",
    to: "",
    subject: ""
  }
};

export default ENV;
