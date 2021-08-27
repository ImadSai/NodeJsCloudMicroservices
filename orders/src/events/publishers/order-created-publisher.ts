import { Publisher, OrderCreatedEvent, Subjects } from "@isticketing/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    readonly subject = Subjects.OrderCreated;
}