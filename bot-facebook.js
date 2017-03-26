/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 */

var Botkit = require('botkit');
var request = require('request');

var convo_last_context = [];

var Sequence = exports.Sequence || require('sequence').Sequence
    , sequence = Sequence.create()
    , err
    ;


var Flutterwave = require('flutterwave');
 
var flutterwave = new Flutterwave("tk_VsZWFR8a76Niu5Yfg9vc", "tk_jVz5e98iAg");


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

controller.hears('Yes that\'s me', 'message_received', function(bot, message) {
    bot.reply(message, "dssdds");
            
});

controller.hears('(.*)', 'message_received', function(bot, message) {
    //if(message.watsonData.output.text.length > 1) {
    // for(var i = 0; i < message.watsonData.output.text.length; i++) {
    //   bot.reply(message, message.watsonData.output.text[i]);
    // }
    
    //check if username is set, set it if not set else fetch it and set it as a watson variable
    if(message.watsonData.output.validate_data !== undefined) {
      // message.watsonData.context = last_context(last_context.length);
      var validate_data = message.watsonData.output.validate_data;
      var value = message.watsonData.output.value;
      // message.watsonData.context.retries = message.watsonData.context.retries + 1;
      // console.log(message.watsonData.context)
      switch(validate_data) {
        case "phone_number":
            if(typeof(value) != Number || value.length != 11) {
               bot.reply(message, "Oops! doesn't look like you entered a valid phone number, try entering in this format 08033275944 \n Enter phone number here");
            }
        break;
      }
    } else {
      if(localStorage.getItem("user_first_name") == undefined || localStorage.getItem("user_first_name") == null) {
          var user_details = get_user_details(message.user, function(err, res) {
              if(message.watsonData.context.first_name != "") {
                  message.watsonData.context.first_name == user_details.first_name;
                  message.watsonData.context.last_name == user_details.last_name;
                  message.watsonData.context.gender == user_details.gender;
              }
          });
      } else {
          message.watsonData.context.first_name = localStorage.getItem("user_first_name");
          message.watsonData.context.last_name = localStorage.getItem("user_last_name");
          message.watsonData.context.gender = localStorage.getItem("user_gender");
      }


      if(message.watsonData.output.payload !== undefined) {
          //fetch and define neccesary attachments 
          var payload = message.watsonData.output.payload;
          payload_type = payload.type;
          payload_file = payload.content;
          
          if(payload_type == "buttons") {
              var output_message = {};
              var buttons = require('./attachments/'+payload_type+'/'+payload_file+'.json');

              output_message.text =  message.watsonData.output.text.join('\n');
              output_message.buttons = buttons;
              
              var output_mesage =  {
                  'type': 'template',
                  'payload': {
                      'template_type': 'button',
                      'text': "Complete your purchase",
                      'buttons': [
                          {
                              "type": "postback",
                              "title": "Pay Airtime",
                              "payload": "Pay Airtime"
                          },
                          {
                              "type": "postback",
                              "title": "Cancel Transaction",
                              "payload": "Cancel Transaction"
                          }
                      ] 
                  }
              }
              output_mesage.atachment = output_mesage;
              
              bot.reply(message, output_message);
          }
          else if(payload_type == "quick_replies") {
              var output_message = {};
              var quick_replies = require('./attachments/'+payload_type+'/'+payload_file+'.json');

              output_message.text =  message.watsonData.output.text.join('\n');
              output_message.quick_replies = quick_replies;
              
              console.log(quick_replies)
              bot.reply(message, output_message);
          }
          else if(payload_type == "catalog") {
              var attachment = require('./attachments/'+payload_type+'/'+payload_file+'.json');
              bot.reply(message, {
                  attachment: attachment,
              });
          } 
          else if(payload_type == 'form_walkthrough') {
            switch(payload_file) {
              case 'account_opening':
                
                var msg_1  = {
                  "text":"So far, here's what i know about you. \n\n Firstname: "+localStorage.getItem("user_first_name")+" \n Lastname: " +localStorage.getItem("user_last_name")+ "\n Gender: " +localStorage.getItem("user_gender")+ "Are these details correct?",
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Yes that's me",
                      "payload":"Yes",
                    },
                    {
                      "content_type":"text",
                      "title":"Nope change details",
                      "payload":"Change Details",
                    }
                  ]
                };

                var msg_2  = {
                  "text":"Yep, we're off to a great start. Supply your BVN and i'll speed this up even further..",
                  "quick_replies":[
                    {
                      "content_type":"text",
                      "title":"Don't have a BVN? :(",
                      "payload":"NoBVN",
                    }
                  ]
                };
                  
                bot.startConversation(message, function(err, convo) {
                    bot.reply(message, msg_1);                      
                    convo.say("Was i close?");

                    convo.ask(msg_1, function(response, convo) {
                        convo.next();
                    });

                    convo.ask(msg_2, function(response, convo) {
                        //Do BVN validation
                        flutterwave.BVN.verify('SMS', response.text, function(err, res, jsonPayload){ 
                          console.log(body); 
                          convo.next();
                        });
                        
                    });
                });

              break;
            }
          }
          else {
          
              bot.reply(message, message.watsonData.output.text.join('\n'));
          }
          
      } else {
          // for(var i = 0; i < message.watsonData.output.text.length; i++) {
          //   bot.reply(message, message.watsonData.output.text[i]);
          // }
          bot.reply(message, message.watsonData.output.text.join('\n'));
      }
      
      //always save the last conext
      console.log(message.watsonData.context);
      
      if(message.watsonData.context != undefined) {
          //convo_last_context = convo_last_context.push(message.watsonData.context);
      }
      
      //}
      //bot.reply(message, message.watsonData.output.text.join('\n'));
    }




      
    
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
