import { Listener, OrderCreatedEvent, OrderStatus, Subjects } from "@isticketing/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";


export class OrderCreatedListener extends Listener<OrderCreatedEvent> {

    readonly subject = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {

        const { id, expireAt } = data;
        const delay = new Date(expireAt).getTime() - new Date().getTime();

        // Add the order to the Queue and Delay
        await expirationQueue.add({
            orderId: id
        }, {
            delay
        });

        // ACK
        msg.ack();
    }

};