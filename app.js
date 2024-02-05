const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Replace the placeholder URL with your actual MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://saba14:saba14@cluster0.dobilew.mongodb.net/lessonsHub?retryWrites=true&w=majority';

// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

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
        const { topic, price, location, space } = req.body;
        const result = await lessonsCollection.insertOne({ topic, price, location, space });
        res.json({ message: 'Lesson added', lessonId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Route to add a new order
    app.post('/orders', async (req, res) => {
      try {
        const { name, phoneNumber, lessonIDs, numberOfSpaces } = req.body;
        const result = await ordersCollection.insertOne({ name, phoneNumber, lessonIDs, numberOfSpaces });
        res.json({ message: 'Order added', orderId: result.insertedId });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(err => console.error(err));
