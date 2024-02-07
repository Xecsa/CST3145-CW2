const express = require('express');
const { MongoClient, ObjectID } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

// Static file middleware for lesson images
app.use((express.static('Public')));

// Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Static file middleware for lesson images
// app.use(('/images',express.static('Public/images')));

// Replace the placeholder URL with your actual MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://saba14:saba14@cluster0.dobilew.mongodb.net/lessonsHub?retryWrites=true&w=majority';

// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Connect to MongoDB
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');
        // Access your database and collection
        const db = client.db('lessonsHub');
        const lessonsCollection = db.collection('lessons');
        const ordersCollection = db.collection('orders');

        // Define routes

        app.get('/', (req,res,next) => {
            res.send('Select a collection, e.g, /collection/messages')
        })

        app.param('', (req,res,next,collectionName) =>{
            req.collection = db.collection(collectionName)
            return next()
        })

        // Route to get all lessons
        app.get('/lessons', async (req, res) => {
            try {
                const lessons = await lessonsCollection.find().toArray();
                res.json(lessons);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Route to get all orders
        app.get('/orders', async (req, res) => {
            try {
                const orders = await ordersCollection.find().toArray();
                res.json(orders);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        // Route to add a new order
        app.post('/orders', async (req, res) => {
            try {
                // const { name, phone, lessons } = req.body;
                // const result = await ordersCollection.insertOne({ name, phone, lessons });
                const result = await ordersCollection.insertOne(req.body);
                res.json({ message: 'Order added', orderId: result.insertedId });

            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });


        app.put ('/lessons/:id', (req, res, next) => {
            req.collection = db.collection("lessons")
            req.collection.update(
                {_id: new ObjectID(req.params.id)},
                {$inc: {space: -1}},
                {safe: true, multi: false},
                (e, result) => {
                    if (e) return next(e)
                    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
                })
            })


            // Search object
        app.get('/search', (req, res,next) => {
           req.collection = db.collection("lessons")
           let {keyword} = req.query
           console.log("searching for "+keyword)
           req.collection.find({}).toArray((err, results) => {
               if (err) return next(err)
               let filteredList = results.filter((lesson) => {
                    return lesson.subject.toLowerCase().includes(keyword.toLowerCase()) || lesson.location.toLowerCase().includes(keyword.toLowerCase())
                });  
                res.send(filteredList)
            })
        })
  




         // File middleware
        app.use(function(req,res,next) {
             var filePath = path.join(__dirname, "Public/images", req.url);
             fs.stat(filePath, function(err, fileInfo) {
                 if (err) {
                     next();
                     return;
                 }
                if (fileInfo.isFile()) {
                    res.sendFile(filePath);
                }
                else {
                      next();
                }
            });
        });


        app.use(function(req,res, next) {
             res.status(404);
             res.send("File not found");
        });
  
  

        // Start the Express server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    })
    .catch(err => console.error(err));
