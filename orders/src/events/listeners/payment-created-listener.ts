import { Message } from "node-nats-streaming";
import { Subjects, Listener, PaymentCreatedEvent, NotFoundError, OrderStatus } from "@isticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {

    readonly subject = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {

        const { id, orderId } = data;

        // Build the Order
        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError();
        }

        // Update status
        order.set({
            status: OrderStatus.Complete
        })

        // Save the Order
        await order.save();

        // ACK message
        msg.ack();
    }
}