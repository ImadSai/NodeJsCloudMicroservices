import { Listener, NotFoundError, OrderCreatedEvent, OrderStatus, Subjects } from "@isticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const { id, version, status, userId, ticket } = data;

        // Save the order
        const order = Order.build({
            id: id,
            version: version,
            status: status,
            userId: userId,
            price: ticket.price
        });

        await order.save();

        // Publish that the Payment were updated

        // ACK
        msg.ack();
    }
}