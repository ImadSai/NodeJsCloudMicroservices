import { OrderStatus } from '@isticketing/common';
import mongoose from 'mongoose';

// An Interface that describes the properties
// that are required to create a new Order 
interface orderInterface {
    id: string;
    version: number;
    userId: string;
    price: number;
    status: OrderStatus;
}

// An Interface that describes the properties
// that a User Document has 
interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    status: OrderStatus;
    price: number;
}

// An Interface that describes the properties
// that a User Model has 
interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: orderInterface): OrderDoc;
    findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
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
    price: {
        type: Number,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

// Set Version Key
orderSchema.set('versionKey', 'version');
orderSchema.pre('save', function (done) {
    this.$where = {
        version: this.get('version') - 1
    }
    done();
});

// Defining the Build Function
orderSchema.statics.build = (attrs: orderInterface) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        price: attrs.price,
        userId: attrs.userId,
        status: attrs.status,
    });
};
// Defining the find by event
orderSchema.statics.findByEvent = (event: { id: string, version: number }) => {
    return Order.findOne({
        _id: event.id,
        version: event.version - 1
    });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
export { OrderStatus };