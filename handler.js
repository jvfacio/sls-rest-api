'use strict';

const {DynamoDBClient} = require("@aws-sdk/client-dynamodb")
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require ("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({region: process.env.AWS_REGION})
const ddbDocClient = DynamoDBDocumentClient.from(client);

// const documentClient = new DynamoDb.DocumentClient({ 
//   region: 'us-east-1',
//   maxRetries: 3,
//   httpOptions: {
//     timeout: 5000
//   }

//  })
const NOTE_TABLE_NAME = process.env.NOTES_TABLE_NAME;


const send = (statusCode, data) => {
  return{
    statusCode: statusCode,
    body: JSON.stringify(data)

  }
}

module.exports.createNote = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName: NOTE_TABLE_NAME,
      // TableName: "notes",
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    }
    // await documentClient.put(params).promise();
    await ddbDocClient.send(new PutCommand(params));
 
    cb(null,send(201,data))
  } catch (error) {
    cb(null,send(500,error.message))
  }
  
};

module.exports.updateNote = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let noteId = event.pathParameters.id;
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: NOTE_TABLE_NAME,
      // Key: { notesId },
      Key: { notesId:noteId },
      UpdateExpression: 'set #title = :title, #body = :body',
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    //await documentClient.update(params).promise()
    await ddbDocClient.send(new UpdateCommand(params));
    cb (null,send(200,data))
    
  } catch (error) {
    cb(null,send(500,error.message))
  }

};

module.exports.deleteNote = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let noteId = event.pathParameters.id;
  
  try {
    const params = {
      TableName: NOTE_TABLE_NAME,
      Key: { notesId:noteId },
      ConditionExpression: 'attribute_exists(notesId)'
    }
    //await documentClient.delete(params).promise()
    await ddbDocClient.send(new DeleteCommand(params));
    cb (null,send(200,noteId))
    
  } catch (error) {
    cb(null,send(500,noteId))
  }
};

module.exports.getAllNotes = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  console.log ("get all notes ");
  console.log (JSON.stringify(event));
  try {
    const params = {
      TableName: NOTE_TABLE_NAME
    }
    //const notes = await documentClient.scan(params).promise()
    const notes = await ddbDocClient.send(new ScanCommand(params));

    cb (null,send(200,notes))
    
  } catch (error) {
    cb(null,send(500,error.message))
  }
};

