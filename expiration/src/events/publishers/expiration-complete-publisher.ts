import { Publisher, ExpirationCompleteEvent, Subjects } from "@isticketing/common";


export class ExpirationComplitePublisher extends Publisher<ExpirationCompleteEvent> {
    readonly subject = Subjects.ExpirationComplete;
}