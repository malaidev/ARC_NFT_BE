import { Logger } from "../../services/Logger"

export const clear = async (req, res) => {
    const log = new Logger('error', req.context.config.url, { request: req.context.config });
    try {
        log.clearAll();
        log.setType('action');
        log.save();
        res.send('Logs cleared');
    } catch (error) {
        log.setData(error);
        log.save();
        res
            .code(500)
            .send('Failued clearing logs')
    }
}