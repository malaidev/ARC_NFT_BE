import mailgun from "mailgun-js";
import { config } from "../../config/config";

export class EmailService {
  api = {
    apiKey: config.mailer.apiKey,
    domain: config.mailer.domain,
  };
  config = {
    from: "",
    to: "",
    subject: "",
    html: "",
  };

  constructor({ from, to, subject, html }) {
    const errors = this.hasErrors(from, to, subject, html);
    if (errors) throw new Error(errors);

    this.config = {
      from: `The DePo <${from}>`,
      to,
      subject,
      html,
    };
  }

  send() {
    return new Promise((resolve, reject) => {
      try {
        const mg = mailgun(this.api);
        mg.messages().send({ ...this.config }, (error, info) => {
          if (error) return reject(error);
          return resolve(info);
        });
      } catch (error) {
        return reject(error.message);
      }
    });
  }

  hasErrors(from, to, subject, html) {
    const errors = [];
    if (!from) errors.push("from");
    if (!to) errors.push("to");
    if (!subject) errors.push("subject");
    if (!html) errors.push("html");
    if (errors.length) {
      return `EmailService: Properties are missing: "${errors.join('", "')}"`;
    }
    return false;
  }
}
