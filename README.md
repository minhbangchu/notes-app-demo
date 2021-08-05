# AWS Serverless

Step 1: Create a DynamoDB table

1.1. Open the DynamoDB console at https://console.aws.amazon.com/dynamodb/.

1.2. Choose Create table.

- For Table name, enter: `notes-app-demo`.

- For Primary key, enter id.

1.3. Choose Create.

Step 2: Create a Lambda function

2.1. Open the Lambda console at https://console.aws.amazon.com/lambda.

2.2. Choose Create function.

- For Function name, enter `notesAppDemo`.

- For Runtime, chosse `Node.js 14.x`

2.3. Under Permissions choose `Change default execution role`.

- Select Create a new role from AWS policy templates.

- For Role name, enter `notesAppDemoRole`.

- For Policy templates, choose `Simple microservice permissions`. This policy grants the Lambda function permission to interact with DynamoDB.

2.4. Choose Create function.

2.5. Open index.js in the console's code editor, and replace its contents with the following code:

```
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const currentDateTime = () => {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  return date + ' ' + time;
};

exports.handler = async(event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
      case "GET /notes":
        body = await dynamo.scan({ TableName: "notes-app-demo" }).promise();
        break;

      case "GET /notes/{id}":
        body = await dynamo
          .get({
            TableName: "notes-app-demo",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        break;

      case "PUT /notes":
        let requestJSON = JSON.parse(event.body);

        let inputData = {
          title: requestJSON.title,
          description: requestJSON.description,
        };

        if (requestJSON.id === undefined) {
          // Create new.
          inputData['id'] = context.awsRequestId;
          inputData['created_at'] = currentDateTime();
          inputData['updated_at'] = currentDateTime();
        }
        else {
          // Update
          inputData['id'] = requestJSON.id;
          inputData['created_at'] = requestJSON.created_at !== undefined ? requestJSON.created_at : currentDateTime();
          inputData['updated_at'] = currentDateTime();
        }

        await dynamo
          .put({
            TableName: "notes-app-demo",
            Item: inputData
          }).promise();

        body = inputData;
        break;

      case "DELETE /notes/{id}":
        await dynamo
          .delete({
            TableName: "notes-app-demo",
            Key: {
              id: event.pathParameters.id
            }
          })
          .promise();
        body = `Deleted`;
        break;

      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  }
  catch (err) {
    statusCode = 400;
    body = err.message;
  }
  finally {
    body = JSON.stringify(body);
  }

  return {
    statusCode,
    body,
    headers
  };
};

```

2.6. Choose Deploy to update your function.


Step 3: Create an HTTP API

3.1. Open the API Gateway console at https://console.aws.amazon.com/apigateway.

3.2. Choose Create API, and then for HTTP API, choose Build.

- For API name, enter `notesAppDemoAPI`

- Choose Next.

3.3. For Configure routes, choose Next to skip route creation (You create routes in Step 4).

3.4. For Define stages, Chose Next

3.5. Review the stage that API Gateway creates for you, and then choose Create.


Step 4: Create routes in API Gateway

Routes are a way to send incoming API requests to backend resources. For this example API, we create four routes:

- GET /notes/{id}

- GET /notes

- PUT /notes

- DELETE /notes/{id}

To create routes:

4.1. Open the API Gateway console at https://console.aws.amazon.com/apigateway.

4.2. Choose your API (Created in step 3).

4.3. Choose `Routes` (In the left menu).

4.4. Choose Create.

- For Method, choose GET.

- For the path, enter `/notes/{id}`. The {id} at the end of the path is a path parameter that API Gateway retrieves from the request path when a client makes a request.

4.5. Choose Create.

Repeat 4.1 to 4.5 for GET /notes, DELETE /notes/{id}, and PUT /notes.


Step 5: Create an integration

You create an integration to connect a route to backend resources. For this example API, you create one Lambda integration that you use for all routes.

5.1. Open the API Gateway console at https://console.aws.amazon.com/apigateway.

5.2. Choose your API (Created in step 3).

5.3. Choose `Integrations` (In the left menu). Click to API `notes PUT`

5.4. In `Integration details` choose `Create and attach an Integaration`.

- For `Integration target` , chosse `Lambda function`

- In `Integration details` > `Lambda function`  > enter `notesAppDemo`

5.5. Choose Create.

For other API, Implement 5.1 to 5.3:

- In `Integration details for route` > Chose `notesAppDemo` > Chose Attach Integration


Step 6: Test your API with Postman

6.1. Open the API Gateway console at https://console.aws.amazon.com/apigateway.

6.2. Choose your API (Created in step 3).

6.3. Note your API's invoke URL. It appears under Invoke URL on the Details page.

6.4. Copy your API's invoke URL.

The full URL looks like: `https://{api-id}.execute-api.{region}.amazonaws.com/notes`.

6.5. Open the Postman:

Ex1, With PUT /notes: 

- Chose method: PUT

- URL: `https://{api-id}.execute-api.{region}.amazonaws.com/notes`

- Body, chose `raw` option and input

```
{ "title": "Note 01", "description": "Test description for Note 01" }
```

- Chose Send

Ex2, With GET /notes: 

- Chose method: GET

- URL: `https://{api-id}.execute-api.{region}.amazonaws.com/notes`

- Chose Send


# React native

Step 1: Install `nodejs`, `npm`, `expo`

Step 2: Install notes app

```
npm install
```

Step 3: Rename file `example.env` to `.env` and Setup `.env` file

```
API_URL=https://{api-id}.execute-api.{region}.amazonaws.com
```

Step 4: Start notes app

```
expo start
```

---
Nguyen Cong Minh

Thank you!!!
