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

// Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Static file middleware for lesson images
app.use((express.static('images')));

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

        // Route to add a new lesson
        app.post('/lessons', async (req, res) => {
            try {
                const { subject, price, location, spaces, image } = req.body;
                const result = await lessonsCollection.insertOne({ subject, price, location, spaces, image });
                res.json({ message: 'Lesson added', lessonId: result.insertedId });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Route to add a new order
        app.post('/orders', async (req, res) => {
            try {
                const { name, phone, lessons } = req.body;
                const result = await ordersCollection.insertOne({ name, phone, lessons });
                res.json({ message: 'Order added', orderId: result.insertedId });
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        });

        // Route to update available lesson space after an order
        // app.put('/lessons/:id', (req, res, next) => {
            // req.collection.update(
                // { _id: new ObjectID(req.params.id) },
                // {$set: req.body},
                // { safe: true, multi: false },
                // (e, result) => {
                    // if (e) return next(e);
                    // res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' })
                // }
            // );
        // });

        app.put ('/lessons/:id', (req, res, next) => {
            req.collection = db.collection("lessons")
            req.collection.update(
                {_id: new ObjectID(req.params.id)},
                {$set: req.body},
                {safe: true, multi: false},
                (e, result) => {
                    if (e) return next(e)
                    res.send((result.result.n === 1) ? {msg: 'success'} : {msg: 'error'})
                })
            })
        
        
        /* app.put('/lessons/:id', async (req, res) => { */
        /*     try { */
        /*         const lessonId = req.params.id; */
        /*         const { spaces } = req.body; */
        /*         const updatedLesson = await lessonsCollection.findOneAndUpdate( */
        /*             { _id: new ObjectID(lessonId) }, */
        /*             { $inc: { spaces: -spaces } }, */
        /*             { returnDocument: 'after' } */
        /*         ); */
        /*         res.json(updatedLesson); */
        /*     } catch (error) { */
        /*         console.error(error); */
        /*         res.status(500).json({ error: 'Internal Server Error' }); */
        /*     } */
        /* }); */

        // Delete object
app.delete('/lessons/:id', (req,res,next)=>{
    req.collection.deleteOne(
        {_id: new ObjectID(req.params.id)},
        (e,results) => {
        if (e) return next(e)
        res.send(results ? {msg: 'sucess'} : {msg: 'error'})
    })
})

     // Search object
app.get('/lessons/:id/search/:keyword', (req, res,next) => {
    let {keyword} = req.params
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err)
        let filteredList = results.filter((lesson) => {
            return lesson.Subject.toLowerCase().match(keyword.toLowerCase()) || lesson.Location.toLowerCase().match(keyword.toLowerCase())
        });  
        res.send(filteredList)
    })
})

// File middleware
app.use(function(req,res,next) {
    var filePath = path.join(__dirname, "images", req.url);
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
