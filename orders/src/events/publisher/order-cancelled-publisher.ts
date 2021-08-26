import { Publisher, OrderCancelledEvent, Subjects } from "@isticketing/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    readonly subject = Subjects.OrderCancelled;
}