import net from 'net';
import { loggerHelper } from './helpers/loggerHelper';

const serviceName = "Logging_centralize";
const PORT = 3000
const HOST = '127.0.0.1'

loggerHelper.init({ logstashAddress: "127.0.0.1:3000", applicationName: "clientapp", serviceName: "clientservice" });

const logger = loggerHelper.logger;

logger.info("this is a message")
