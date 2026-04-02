import express from 'express';

const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sportz Server is running on port 8000!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
