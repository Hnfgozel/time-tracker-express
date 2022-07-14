require("dotenv").config();
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import * as swaggerDocument from '../swagger.json';


import connectDB from './database/config';
import routes from './routes';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");
app.set("views", "views");

app.use('/api', routes);

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/customers', (req, res) => {
    res.json('hello world');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    connectDB();
});

export default app;
