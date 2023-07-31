const mongoose = require('mongoose');
const config = require('./utils/config');
const app = require('./app');

console.log('Connecting to MongoDB');
mongoose.connect(config.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(config.PORT, () => {
            console.log(`Server running on PORT ${config.PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB', error);
    });