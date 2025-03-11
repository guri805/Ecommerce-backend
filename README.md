# Backend Dependencies

1. BcryptJS
Command: npm i bcryptjs
Version: "bcryptjs": "^3.0.2"

2. Body-Parser
Command:npm i body-parser
Version: "body-parser": "^1.20.3"

3. Cloudinary
Command:npm i cloudinary
Version: "cloudinary": "^2.5.1"

4. CORS
Command:npm i cors
Version: "cors": "^2.8.5"

5. Dotenv
Command:npm i dotenv
Version: "dotenv": "^16.4.7"

6. Express
Command:npm i express
Version: "express": "^4.21.2"

7. JSON Web Token (JWT)
Command:npm i jsonwebtoken
Version: "jsonwebtoken": "^9.0.2"

8. Mongoose
Command:npm i mongoose
Version: "mongoose": "^8.12.1"

9. Multer
Command:npm i multer
Version: "multer": "^1.4.5-lts.1"

10. Nodemailer
Command:npm i nodemailer
Version: "nodemailer": "^6.10.0"

11. Nodemon
Command:npm i nodemon
Version: "nodemon": "^3.1.9"

# Environment Variables
Create a .env file at the root of the project and add the following variable:

MONGO_URL=<Your MongoDB Connection URL>
PORT=<Your Server Port>

SESSION_SECRET=<Your Session Secret Key>
JSON_WEB_TOKEN_SECRET_KEY=<Your JWT Secret Key>
JWT_SECRET=<Your JWT Secret>


EMAIL=<Your Email Address>
EMAIL_PASS=<Your Email Password>

CLOUDINARY_CONFIG_CLOUD_NAME=<Your Cloudinary Cloud Name>
CLOUDINARY_CONFIG_API_KEY=<Your Cloudinary API Key>
CLOUDINARY_CONFIG_API_SECRET=<Your Cloudinary API Secret>