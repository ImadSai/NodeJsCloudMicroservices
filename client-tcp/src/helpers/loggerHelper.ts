import winston from 'winston';

class LoggerHelper {

    protected _logger?: winston.Logger;
    private logstashAddress?: string;
    private applicationName?: string;
    private serviceName?: string;

    get logger() {
        if (!this._logger) {
            throw new Error('Cannot access logger before initializing')
        }
        return this._logger;
    }

    // Logstash Logs levels
    private logstashLevels = {
        error: 0,
        warn: 1,
        info: 2,
        http: 3
    };

    // Logs colors
    private colors = {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'white',
    }

    private addMoreInformations = winston.format(info => {
        info["@timestamp"] = new Date().toISOString();
        info.applicationName = this.applicationName;
        info.serviceName = this.serviceName;
        return info;
    });

    /**
     * Returns Transport logger
     */
    private getTransports() {

        // All Logs Transport
        const allLogsTransport = new winston.transports.File({
            filename: 'logs/all.log'
        });

        // Errors logs Transport
        const errorsTransport = new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        });

        // Console Transport
        const consoleTransport = new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.cli({
                    colors: this.colors
                })
            ),
            handleExceptions: true
        });

        // Http Transport
        const logstashTransport = new winston.transports.Http({
            host: this.logstashAddress!.split(':')[0],
            port: this.logstashAddress!.split(':').length > 1 ? Number(this.logstashAddress!.split(':')[1]) : 80,
            format: winston.format.combine(
                this.addMoreInformations()
            ),
        });

        return [allLogsTransport, errorsTransport, consoleTransport, logstashTransport];
    };


    // Initiakize the logger
    init(informations: { logstashAddress: string, applicationName: string, serviceName: string }) {
        return new Promise<void>((resolve, _) => {
            // Specify logstash Address and other informations
            this.logstashAddress = informations.logstashAddress;
            this.applicationName = informations.applicationName;
            this.serviceName = informations.serviceName;

            // Create the logger
            const logger = winston.createLogger({
                transports: this.getTransports()
            });

            this._logger = logger;

            resolve();
        });
    };
}

// Singleton logger helper
export const loggerHelper = new LoggerHelper();