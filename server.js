const express = require("express");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(express.json());

const routersPath = path.join(__dirname, "routes");

// Recursively load all route files
function loadRoutes(directory, prefix = "") {
  fs.readdirSync(directory).forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    // If it's a folder, recursively search inside it
    if (stat.isDirectory()) {
      loadRoutes(filePath, `${prefix}/${file}`);
    } else if (file.endsWith(".js")) {
      const router = require(filePath);

      const defaultName = path.basename(file, ".js");
      const routePrefix = router.customPath || `${prefix}/${defaultName}`;

      // Mount the router
      app.use(routePrefix, router);

      console.log(`Mounted ${filePath} -> ${routePrefix}`);
    }
  });
}

loadRoutes(routersPath);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
