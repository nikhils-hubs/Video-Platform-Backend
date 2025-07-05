import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Test server working!' });
});

app.post('/test', (req, res) => {
    res.json({ message: 'POST request working!', body: req.body });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});