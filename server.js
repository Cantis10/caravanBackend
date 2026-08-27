const express = require("express");
const fs = require('fs');
const path = require('path');
require("dotenv").config();


const app = express();
const PORT = 3000;
app.use(express.json());

const routersPath = path.join(__dirname, 'routes');

fs.readdirSync(routersPath).forEach((file) => {
    if (file.endsWith('.js')) {
        const filePath = path.join(routersPath, file);
        
        // Require the router
        const router = require(filePath);
        
        // Fallback to filename (minus .js) if router.customPath isn't defined
        const defaultName = path.basename(file, '.js');
        const routePrefix = router.customPath || `/${defaultName}`;
        
        // Mount it using the custom path variable
        app.use(routePrefix, router);
        
        console.log(`Mounted ${file} -> ${routePrefix}`);
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
