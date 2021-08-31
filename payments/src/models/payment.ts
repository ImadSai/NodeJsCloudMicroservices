import mongoose from 'mongoose';

// An Interface that describes the properties
// that are required to create a new Payment 
interface paymentInterface {
    orderId: string;
    stripeId: string;
}

// An Interface that describes the properties
// that a Payment Document has 
interface paymentDoc extends mongoose.Document {
    orderId: string;
    stripeId: string;
}

// An Interface that describes the properties
// that a Payment Model has 
interface paymentModel extends mongoose.Model<paymentDoc> {
    build(attrs: paymentInterface): paymentDoc;
    findByEvent(event: { id: string, version: number }): Promise<paymentDoc | null>;
}

// Defining the Schema
const paymentSchema = new mongoose.Schema<paymentDoc>({
    orderId: {
        type: String,
        required: true
    },
    stripeId: {
        type: String,
        required: true,
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
paymentSchema.statics.build = (attrs: paymentInterface) => {
    return new Payment(attrs);
};

const Payment = mongoose.model<paymentDoc, paymentModel>('Payment', paymentSchema);

export { Payment };