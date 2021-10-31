const express = require('express');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000;

// middlwear
app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gz6qn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        const database = client.db('tourism_place');
        const ordercollection = database.collection('orders')
        const servicescollection = database.collection('services');
        // get api
        app.get('/services', async (req, res) => {
            // const cursor = servicescollection.find({});
            // const services = await cursor.toArray();
            const result = await servicescollection.find({}).toArray()
            res.send(result)
        })
        // get singleItem
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicescollection.findOne(query);
            res.json(result);
            console.log(result);
        })
        // post api
        app.post('/addservice', async (req, res) => {
            const service = req.body
            const result = await servicescollection.insertOne(service)
            res.json(result)
        })
        // get order
        app.get('/getOrder', async (req, res) => {
            const email = req.query.email;
            await ordercollection.find({ email }).toArray((err, documents) => {
                res.send(documents)
            });
        })
        // delete order
        app.delete('/deleteOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordercollection.deleteOne(query);
            res.json(result)
        })
        //post add order
        app.post('/addOrder', async (req, res) => {
            const order = req.body;
            const result = await ordercollection.insertOne(order);
            console.log(result);
            res.json(result)
        })
        // Delete Api
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicescollection.deleteOne(query);
            res.json(result)

        })

        // update order 
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateOrder.order.status
                }
            }
            const result = await ordercollection.updateOne(filter, updateDoc, options)

            console.log("updating ", updateOrder);
            res.json(result);
        })

    }
    finally {
        //  await client.close()
    }

}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('hello world')
});
app.listen(port, () => {
    console.log('runnig port', port);
})

