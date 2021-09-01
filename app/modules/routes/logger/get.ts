import { Logger } from "../../services/Logger"

export const get = async (req, res) => {
    const log = new Logger('error', req.path)
    res.send(log.show());
}