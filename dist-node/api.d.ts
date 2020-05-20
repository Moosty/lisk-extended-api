export declare class ExtendedHTTPApi {
    channel: any;
    options: any;
    logger: any;
    scope: any;
    constructor(channel: any, options: any);
    bootstrap(): Promise<void>;
    cleanup(): Promise<void>;
}
