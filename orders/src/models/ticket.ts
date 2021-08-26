import mongoose from 'mongoose';
import { Order, OrderStatus } from './order';

// An Interface that describes the properties
// that are required to create a new User 
interface ticketInterface {
    title: string;
    price: number;
}

// An Interface that describes the properties
// that a User Document has 
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    isReserved(): Promise<Boolean>;
}

// An Interface that describes the properties
// that a User Model has 
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: ticketInterface): TicketDoc;
}

// Defining the Schema
const ticketSchema = new mongoose.Schema<TicketDoc>({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Defining the Build Function
ticketSchema.statics.build = (attrs: ticketInterface) => {
    return new Ticket(attrs);
};

ticketSchema.methods.isReserved = async function (): Promise<Boolean> {
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaintingPayment,
                OrderStatus.Complete,
            ]
        }
    });
    return (existingOrder != null);
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };