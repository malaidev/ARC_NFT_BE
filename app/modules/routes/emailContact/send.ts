import { FastifyReply, FastifyRequest } from "fastify";
import { EmailService } from '../../services/EmailService';

export const send = async (req: FastifyRequest, res: FastifyReply) => {
  try {
  const { configEmail } = req.body as any;
    const MailService = new EmailService(configEmail);
    await MailService.send()
    
    return res.send({ message: 'Successfully!' })
  } catch(err){
    return res.status(400).send({ err: 'Something went wrong!' })
  }
}
