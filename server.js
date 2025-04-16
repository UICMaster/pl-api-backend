const express = require('express');
const cors = require('cors');
const seasonRoute = require('./routes/season');

const app = express();
app.use(cors());

app.use('/api', seasonRoute);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
