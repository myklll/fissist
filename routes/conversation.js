require('dotenv').load();
var express = require('express');
var router = express.Router();


var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
    username: process.env.CONVERSATION_USERNAME, // replace with username from service key
    password: process.env.CONVERSATION_PASSWORD, // replace with password from service key
    path: { workspace_id: process.env.WORKSPACE_ID }, // replace with workspace ID
    version_date: '2016-07-11'
});



//This would handle calls to the conversation api
/**
 * Handling Initial call to the conversation api
 */
router.get('/conversation', function(req, res, next) {
    conversation.message({}, function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})

/**
 * End Initial Call to conversation API
 */


/**
 * Handles message sending to the conversation API
 */
router.post('/postConversation', function(req, res, next) {
    var message = req.body.message;
    var context = req.body.context;

    conversation.message({ input: { text: message }, context : context},  function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})

module.exports = router;