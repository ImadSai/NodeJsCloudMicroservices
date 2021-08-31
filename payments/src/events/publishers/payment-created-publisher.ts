import { Publisher, PaymentCreatedEvent, Subjects } from "@isticketing/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    readonly subject = Subjects.PaymentCreated;
}