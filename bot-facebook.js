/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var Botkit = require('botkit');
var request = require('request');

var controller = Botkit.facebookbot({
  access_token: process.env.FB_ACCESS_TOKEN,
  verify_token: process.env.FB_VERIFY_TOKEN
});

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

//Declare Global variables
var last_intent = null;
var current_intent = null;

var bot = controller.spawn({
});

controller.on('facebook_optin', function(bot, message) {
    console.log(message);
    bot.reply(message, message.watsonData.output.text.join('\n'));
});

localStorage.clear();

controller.hears('(.*)', 'message_received', function(bot, msg) {
    //if(message.watsonData.output.text.length > 1) {
    // for(var i = 0; i < message.watsonData.output.text.length; i++) {
    //   bot.reply(message, message.watsonData.output.text[i]);
    // }

    //check if username is set, set it if not set else fetch it and set it as a watson variable

    
    //console.log(typeof(message.watsonData.context))

    var message = JSON.parse(msg)
    
    if(localStorage.getItem("user_first_name") == undefined || localStorage.getItem("user_first_name") == null) {
        var user_details = get_user_details(message.user, function(err, res) {
            if(message.watsonData.context.first_name != "") {
                message.watsonData.context.first_name == user_details.first_name;
                message.watsonData.context.last_name == user_details.last_name;
                message.watsonData.context.gender == user_details.gender;
            }
        });
    } else {
        // message.watsonData.context.first_name = localStorage.getItem("user_first_name");
        // message.watsonData.context.last_name = localStorage.getItem("user_last_name");
        // message.watsonData.context.gender = localStorage.getItem("user_gender");
    }

    //console.log(message.watsonData.context.first_name);
    //console.log(message.watsonData.context);


    if(message.watsonData.output.payload !== undefined) {
        //fetch and define neccesary attachments 
        var payload = message.watsonData.output.payload;
        payload_type = payload.type;
        payload_file = payload.content;

        if(payload_type == "quick_replies") {
            var output_message = {};
            var quick_replies = require('./attachments/'+payload_type+'/'+payload_file+'.json');

            output_message.text =  message.watsonData.output.text.join('\n');
            output_message.quick_replies = quick_replies;
            
            bot.reply(message, output_message);
        }
        else if(payload_type == "catalog") {
            var attachment = require('./attachments/'+payload_type+'/'+payload_file+'.json');
            bot.reply(message, {
                attachment: attachment,
            });
        } else {
         
            bot.reply(message, message.watsonData.output.text.join('\n'));
        }
        
    } else {
        // for(var i = 0; i < message.watsonData.output.text.length; i++) {
        //   bot.reply(message, message.watsonData.output.text[i]);
        // }
        bot.reply(message, message.watsonData.output.text.join('\n'));
    }
    
    //}
    //bot.reply(message, message.watsonData.output.text.join('\n'));
    
});

function get_user_details(user_id) {
    var url = "https://graph.facebook.com/v2.6/" + user_id + "?access_token="+process.env.FB_ACCESS_TOKEN;

    request.get(url, function(err, res, body) {
        if(err) console.log(err);

        var result = JSON.parse(res.body);
        localStorage.setItem("user_first_name", result.first_name);
        localStorage.setItem("user_last_name", result.last_name);
        localStorage.setItem("user_gender", result.gender);
    })
}

module.exports.controller = controller;
module.exports.bot = bot;