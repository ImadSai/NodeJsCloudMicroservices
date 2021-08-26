import { OrderStatus } from '@isticketing/common';
import mongoose from 'mongoose';
import { TicketDoc } from './ticket';

// An Interface that describes the properties
// that are required to create a new Order 
interface orderInterface {
    userId: string;
    status: string;
    expireAt: Date;
    ticket: TicketDoc;
}

// An Interface that describes the properties
// that a User Document has 
interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatus;
    expireAt: Date;
    ticket: TicketDoc;
}

// An Interface that describes the properties
// that a User Model has 
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: orderInterface): OrderDoc;
}

// Defining the Schema
const orderSchema = new mongoose.Schema<OrderDoc>({
    userId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    expireAt: {
        type: mongoose.Schema.Types.Date
    },
    ticket: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ticket'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Defining the Build Function
orderSchema.statics.build = (attrs: orderInterface) => {
    return new Order(attrs);
};


const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
export { OrderStatus };