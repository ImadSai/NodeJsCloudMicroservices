import { Listener, NotFoundError, OrderCancelledEvent, OrderStatus, Subjects } from "@isticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { queueGroupName } from "./queue-group-name";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {

    readonly subject = Subjects.OrderCancelled;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {

        const { id, version } = data;

        // Find the order
        const order = await Order.findByEvent({ id, version });

        if (!order) {
            throw new NotFoundError();
        }

        order.set({
            status: OrderStatus.Cancelled,
            version
        });

        // Save the Order
        await order.save();

        // Publish that the Payment were updated

        // ACK
        msg.ack();
    }
}