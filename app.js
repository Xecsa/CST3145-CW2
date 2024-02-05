const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path'); // Require the 'path' module

const app = express();
const port = 3000;

// Replace the placeholder URL with your actual MongoDB Atlas connection string
const mongoURI = 'mongodb+srv://saba14:saba14@cluster0.dobilew.mongodb.net/lessonsHub?retryWrites=true&w=majority';

// Create a MongoDB client
const client = new MongoClient(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Use body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Middleware: Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Middleware: Static file middleware for lesson images
app.use('/images', express.static('images'));


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
      const { subject, price, location, spaces, image } = req.body; // Update the expected data fields
      const result = await lessonsCollection.insertOne({ subject, price, location, spaces, image });
      res.json({ message: 'Lesson added', lessonId: result.insertedId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
    
    
    
    
    
    
    
    
    

    // Route to add a new order
    // Route to add a new order
app.post('/orders', async (req, res) => {
    try {
      const { name, phone, lessons } = req.body; // Update the expected data fields
      const result = await ordersCollection.insertOne({ name, phone, lessons });
      res.json({ message: 'Order added', orderId: result.insertedId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

    // Route to update available lesson space after an order
        
      // Route to update available lesson space after an order
app.put('/lessons/:id', async (req, res) => {
    try {
      const lessonId = req.params.id;
      const { spaces } = req.body; // Update the expected data field
      // Implement the logic to update available space for the lesson
      // Example: decrement the available space by 'spaces' from the order
      const updatedLesson = await lessonsCollection.findOneAndUpdate(
        { _id: lessonId },
        { $inc: { spaces: -spaces } }, // Adjust the update based on the expected data field
        { returnDocument: 'after' }
      );
      res.json(updatedLesson);
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
