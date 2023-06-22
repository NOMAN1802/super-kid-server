const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const uri = "mongodb://0.0.0.0:27017"

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bduz0qc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    // await client.connect();
     client.connect();
    // Database collection create

    const toyCollection = client.db('superKidToys').collection('toys');
    app.get('/toys', async (req, res) => {
      const cursor = toyCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    
    // category wise get

    app.get("/allToysByCategory/:category", async (req, res) => {
      console.log(req.params.id);
      const result = await toyCollection
        .find({
          category: req.params.category,
        })
        .toArray();
      res.send(result);
    });

    // Single toy details
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);

      res.send(result);
    });
   
    // search API
    app.get("/findToysByName/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyCollection
        .find({
          $and: [
            { name: { $regex: text, $options: "i" } },
            
          ],
        })
        .toArray();
      res.send(result);
    });
    
    // Add toy API
    app.post('/addToy', async (req,res)=>{
      const body = req.body;
      const result = await toyCollection.insertOne(body);
      res.send(result)

      console.log(result);
    })

  
    // My toy API

    app.get("/myToys/:email", async (req, res) => {
      console.log(req.params.id);
      const toys = await toyCollection
        .find({
          email: req.params.email,
        })
        .sort({ price: -1 })
        .toArray();
      res.send(toys);
    });
 

    // Update API

    app.put("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      console.log(body);
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          
          price: body.price,
          available_quantity: body.available_quantity,
          detail_description: body.detail_description,
          sub_category: body.sub_category
        },
      };
      const result = await toyCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    // To delete API
  
  app.delete("/deleteToy/:id", async (req, res) => {
    const result = await toyCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    console.log(result);
    res.send(result);
  });
  

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Super kid is running')
})


app.listen(port, () => {
  console.log(`Super kid API is running on port: ${port}`);
})