import { Message } from "padlocal-client-ts/dist/proto/padlocal_pb";
export declare enum AppMessageType {
    Text = 1,
    Img = 2,
    Audio = 3,
    Video = 4,
    Url = 5,
    Attach = 6,
    Open = 7,
    Emoji = 8,
    VoiceRemind = 9,
    ScanGood = 10,
    Good = 13,
    Emotion = 15,
    CardTicket = 16,
    RealtimeShareLocation = 17,
    ChatHistory = 19,
    MiniProgram = 33,
    MiniProgramApp = 36,
    GroupNote = 53,
    Transfers = 2000,
    RedEnvelopes = 2001,
    ReaderType = 100001
}
export interface AppAttachPayload {
    totallen?: number;
    attachid?: string;
    emoticonmd5?: string;
    fileext?: string;
    cdnattachurl?: string;
    aeskey?: string;
    cdnthumbaeskey?: string;
    encryver?: number;
    islargefilemsg: number;
}
export interface AppMessagePayload {
    des?: string;
    thumburl?: string;
    title: string;
    url: string;
    appattach?: AppAttachPayload;
    type: AppMessageType;
    md5?: string;
    fromusername?: string;
    recorditem?: string;
}
export declare function appMessageParser(message: Message.AsObject): Promise<AppMessagePayload>;
//# sourceMappingURL=message-appmsg.d.ts.map