import { FastifyReply, FastifyRequest } from "fastify";
import { EmailService } from "../../services/EmailService";
import { respond } from "../../util/respond";

export const send = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const { configEmail } = req.body as any;
    const MailService = new EmailService({
      ...configEmail,
      to: 'contact@depo.io',
    });
    await MailService.send();

    return res.code(204).send();
  } catch (err) {
    return res.status(400).send(respond("Something went wrong.", true, 400));
  }
};
