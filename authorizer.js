const {CognitoJwtVerifier} = require("aws-jwt-verify");
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID

})

const generatePolicy = (principalId, effect,resource) => {
    var authResponse = {}
    authResponse.principalId = principalId;

    if (effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: effect,
                Resource: resource,
                Action: "execute-api:Invoke",
              },
            ],
          };
          authResponse.policyDocument = policyDocument;
    }
    
    console.log ("*-*-",JSON.stringify(authResponse));
    return authResponse;
}


exports.handler = async (event,contex,callback) =>{
    //lambda code
    var token = event.authorizationToken; // "Allow" or "Deny"
    console.log ("event:",event);
    console.log ("token:",token);
   try {
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        callback(null,generatePolicy("user","Allow",event.methodArn))
   } catch (error) {
        callback("Error: invalid token");
   } 
   
};