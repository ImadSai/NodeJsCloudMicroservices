import { Message } from "node-nats-streaming";
import { Subjects, Listener, ExpirationCompleteEvent, OrderStatus, NotFoundError, loggerHelper } from "@isticketing/common";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {

    readonly subject = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {

        const { orderId } = data;

        // Update the order status
        const order = await Order.findById(orderId).populate('ticket');

        // If the order is not find
        if (!order) {
            throw new NotFoundError();
        }

        // If the order is Complete we don't cancel it
        if (order.status === OrderStatus.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatus.Cancelled
        });

        await order.save();

        // Publish event saying that the order was cancelled
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        });

        // Log informations 
        logger.info(`Order cancelled`, { "orderId": order.id, "ticketId": order.ticket.id });

        // ACK message
        msg.ack();
    }
}