# Endpoint 1: Get All Subscription Plans. 

#### Description: 

 - This API will help to get the three product’s information which will be displayed in the main screen under the “Product” section. 

#### HTTP Method and URL:  (e.g., POST /api/v1/auth/login)
- GET /api/v1/products (I got this based on Stripe’ documentation: http://localhost:3000/api/products - https://docs.stripe.com/api/products/list) 

#### Request JSON Format:  A sample of the data sent to the server.
- N/A (This is a GET request, so nothing is sent). 

#### Response JSON Format: A sample of the expected data returned by the server.
```json
[
  {
    "id": "prod_ID",
    "name": "Name",
    "description": "Description",
    "features": [],
    "default_price": null,
    "url": null
    
  },
  {
    "id": "prod_ID",
    "name": "Name",
    "description": "Description",
    "features": [],
    "default_price": null,
    "url": null
    
  },
  {
    "id": "prod_ID",
    "name": "Name",
    "description": "Description",
    "features": [],
    "default_price": null,
    "url": null
    
  }
]
```
#### Headers: Specify if an Authorization Bearer token or other headers are required.

- I need to verify this with professor in class

#### Possible Error Responses: Document expected status codes (400, 401, 403, 500).
 
 - Possible codes expected:
    -   400 (Bad request): If the API did not understand the query parameters.
    - 401 (Unauthorized): In case we need to specify access information in the headers.
    - 500 (Server error): Any problem in the server.

# Application Flow and Folder Structure

**Step-by-Step Flow: Provide a written sequence of the frontend behavior: User Action → API Call → Response Handling → UI Update.**

The process starts:
1. The main page which contains the product's information must be loaded completely.
2. Automatically a separated function must initiate a GET request to the API, let's say: http://localhost:123/api/products
3. Once the information is received, it must be converted in JSON
4. The information is then send back to the front end which will present it in the corresponding HTML and CSS (Taildwind) format.

**Project Organization: Propose a clean folder structure. For example, separate directories for JavaScript logic (/js), assets (/assets), and HTML files. Provide a brief explanation for the purpose of each file.**

Directory:
 - css: This directory will contain personilized style.
 - img: This directory will contain all images used in the project.
 - script: All Javascript must be placed in this directory.
 - others: In case of other unexpected files, this is the place to store them.
 (In the root must be only the index.html)

