/* ************************************ */
/* Define helper functions */
/* ************************************ */
var getInstructFeedback = function() {
  return '<div class = "centerbox"><p class = "center-block-text">' + feedback_instruct_text +'</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

// Welcome block

var feedback_instruct_text = 'Welcome to the experiment. This experiment will take about 30 minutes. Press <strong>enter</strong> to begin.'

var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: getInstructFeedback,
  timing_post_trial: 0,
  timing_response: 180000
};

// Instructions node (looping until read through slowly)

var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = "centerbox"><p class = "block-text">In this experiment you will be presented with two amounts of money to choose between. One of the options will be $20 available now. The other will be a variable amount available in the future. Your job is to indicate whether you prefer $20 now or the larger amount in the future.</p><p class = "block-text">When making your choices you will only see the larger amount available in the future on the screen. The other option, $20 now, will not be shown.</p></div>',
    '<div class = "centerbox"><p class = "block-text">After seeing the larger amount of money available in the future you will be presented with a <font color= "red">red X</font> and a <font color= "lime">green check</font>.</p><p class = "block-text">You should choose the <font color= "red">red X</font> if you reject the amount you have seen and prefer $20 now. On the other hand, you should select the <font color= "lime">green check</font> if you prefer the amount you have seen. Indicate your preferences using the "p" and "q" keys.</p></div>',
    '<div class = "centerbox"><p class = "block-text">You should indicate your <strong>true</strong> preference because at the end of the experiment a random trial will be chosen and you will receive a bonus payment proportional to the option you selected at the time point you chose.</p></div>',
  ],
  allow_keys: false,
  show_clickable_nav: true
};

var sumInstructTime = 0 
var instructTimeThresh = 0 

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (var i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <strong>enter</strong> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <strong>enter</strong> to continue.'
      return false
    }
  }
}

// Practice 

var practice_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {trial_id: "instruction"},
  text: "<div class = 'centerbox'><p class = 'block-text'>Here is an example trial. Please indicate your choice between $20 now and the amount you will see on the screen. Press 'p' for right and 'q' for left. </p><p class = 'block-text'>Press <strong>enter</strong> to continue.</p></div>",
  timing_post_trial: 0,
  timing_response: 180000
};

var fixation_block = {
  type: 'single-stim',
  stimulus: "<div class = 'circle' id = 'green_circle' style = 'font-size:150px; color: lime'>&#9679;</div>",
  is_html: true,
  choices: 'none',
  data: {trial_id: "fixation"},
  response_ends_trial: false,
  timing_stim: -1,
  timing_response: 500
}

var practice_stim_block = {
  type: 'single-stim',
  stimulus: '<div class = "centerbox"><div class = "stim-text"><p style="font-size:100px">$26</p><br><p style="font-size:100px">30 days</p></div></div>',
  data: {large_amt: 26, later_del: 30, trial_id: 'stim', exp_stage: 'practice'},
  is_html: true,
  choices: 'none',
  response_ends_trial: false,
  timing_stim: -1,
  timing_response: 2000
}

var getJitterLength = function() {
  return 3000 + Math.random() * 4000
}

var jitterLength = getJitterLength()

var jitter_block = {
  type: 'single-stim',
  stimulus: "<div class = 'circle' id = 'red_circle' style = 'font-size:150px; color: red'>&#9679;</div>",
  is_html: true,
  choices: 'none',
  data: {trial_id: "jitter", jitterLength: jitterLength},
  response_ends_trial: false,
  timing_stim: -1,
  timing_response: jitterLength,
}

var practice_response_block = {
  type: 'single-stim',
  stimulus: '<div class = "mark lft" id = "x-mark" style = "color:red">&#10005;</div><div class = "mark rght" id = "check-mark" style = "color:lime">&#10003;</div>',
  is_html: true,
  choices: [80,81],
  data: {
    trial_id: "response",
    exp_stage: "practice",
    left_x: 1,
    large_amt: 26, 
    later_del: 30
  },
  response_ends_trial: true,
  timing_stim: -1,
  timing_response: 2000, //how long to wait if no response
  on_finish: function(data) {
    
    var choice = false;
           
    $('.jspsych-display-element').html('<div id = "jspsych-single-stim-stimulus"></div>')
    $('#jspsych-single-stim-stimulus').append(data.stimulus)

    if(data.key_press == 80){
      $('.rght').css('border', '10px white solid')
      if(data.left_x == 1){
        choice = 'll'
      } else if (data.left_x == 0){
        choice = 'ss'
      }
    } 
    else if (data.key_press == 81){
      $('.lft').css('border', '10px white solid')
      if(data.left_x == 1){
        choice = 'ss'
      } else if (data.left_x == 0){
        choice ='ll'
      }
    }

    // commented this out because it seemed to clear the screen for the following test_instruct_block 
    // make sure to check later that the timings are correct for this response screen using timing_response
    // setTimeout(function() {
    //     $('.jspsych-display-element').html('');
    //   }, 2000-data.rt); //how long after to clear display (however much is left from 2000 ms)

    jsPsych.data.addDataToLastTrial({
      choice: choice
    });
  }
}

var getPracticeChoice = function(){
  var choice = jsPsych.data.getLastTrialData().choice
  if (choice == 'll'){
    return "<div class = 'centerbox'><p class = 'block-text'>You chose $26 in 30 days. <p class = 'block-text'>You will now begin the calibration trials. Please indicate your choice between $20 now and the amount you see on the screen. </p><p class = 'block-text'>Make sure to indicate your <strong>true</strong> preferences</p><p class = 'block-text'>Press <strong>enter</strong> to continue.</p></div>"
  } else if (choice == 'ss'){
    return "<div class = 'centerbox'><p class = 'block-text'>You chose $20 today. <p class = 'block-text'>You will now begin the calibration trials. Please indicate your choice between $20 now and the amount you see on the screen. </p><p class = 'block-text'>Make sure to indicate your <strong>true</strong> preferences</p><p class = 'block-text'>Press <strong>enter</strong> to continue.</p></div>"
  } else {
    return "<div class = 'centerbox'><p class = 'block-text'>You did not make a choice. Please make sure to respond before the trial ends. <p class = 'block-text'>You will now begin the calibration trials. Please indicate your choice between $20 now and the amount you see on the screen. </p><p class = 'block-text'>Make sure to indicate your <strong>true</strong> preferences</p><p class = 'block-text'>Press <strong>enter</strong> to continue.</p></div>"
  }
}

var test_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {trial_id: "instruction"},
  text: getPracticeChoice,
  timing_post_trial: 0,
  timing_response: 180000
}; 


// Calibration block
// In this task, subjects made repeated choices between 20€ available immediately and larger but delayed hypothetical amounts 
// of money (delays [days]: 1, 2, 7, 14, 30, 90, 180). The hypothetical rewards always amounted to at least 20.5€, 
// but without an upper limit. An adjusting-amount procedure was used such that, following two successive choices of 
// the delayed reward, the delayed amount was reduced, and following two successive choices of the immediate reward, 
// the delayed amount was increased in a step-wise manner. The algorithm terminated as soon as the difference between 
// accepted and rejected delayed amounts reached a delay-specific criterion [Criterion in €: 1.0 (1d), 1.5 (2d), 
// 2.0 (7d), 2.0 (14d), 3.0 (30d), 4.0 (90d), 4.0 (180d)]

// the assignment of true for a given trace should happen at the response block
// in the stim block it should take all the data for that trace, check if there is a true if not
// check last two responses
// increase if both are impatient, decrease if both are patient
// what if one is patient and the other impatient?
// there should be some conditions: e.g. in the beginning when there is no data for it

// What the output text string should look like
'<div class = "centerbox"><div class = "stim-text"><p style="font-size:100px">$'+amount+'</p><br><p style="font-size:100px">'+delay+ 'days</p></div></div>'

//function to generate random number within an interval
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

//function to generate random integer within an interval
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

var calibStim = function(){

  //empty text strings to be populated
  var amount = ''
  var delay = ''

  //traces (delays)
  var traces = [1,2,7,14,30, 90, 180]

  //Choose a random integer that can be used as an index to choose from the array of traces
  var i = getRandomInt(0,6)

  //get data for the chosen trace. if there isn't any this will be an empty array
  var traceData = getDataMatchingCondition(jsPsych.data.getData(), 'later_del', trace[i])

  // if beginning (i.e. the length of the returned array is 0)
  if(traceData.length == 0){
    // choose random number that is larger than 20 + threshold
    if (trace[i] == 1){
      amount = 20 + 1 + randomNumber
    } else if (trace[i] == 2){
      amount = 20 + 1.5 + randomNumber
    } else if (trace[i] == 7 | trace[i] == 14){
      amount = 20 + 2 + randomNumber
    } else if (trace[i] == 30){
      amount = 20 + 3 + randomNumber
    } else if (trace[i] == 90 | trace[i] == 180){
      amount = 20 + 4 + randomNumber
    }
  } else {
     // if the criterion is true 
      if (getDataMatchingCondition(traceData, 'criterion', true).length != 0){
      //then choose new number
      } else { // if criterion is false
           // if the last two choices are impatient
          if(traceData[traceData.length - 1].choice == 'll' & traceData[traceData.length - 2].choice == 'll'){
            //decrease amount but not below threshold
            var large_amt = traceData[traceData.length - 1].large_amt

            if (trace[i] == 1){
              amount = 
            } else if (trace[i] == 2){
              amount = 
            } else if (trace[i] == 7 | trace[i] == 14){
              amount = 
            } else if (trace[i] == 30){
              amount = 
            } else if (trace[i] == 90 | trace[i] == 180){
              amount = 
            }
          }
      }
  }
}

// var calib_stim_block = {
//   type: 'single-stim',
//   stimulus: ,
//   data: {
//     large_amt: , 
//     later_del: , 
//     trial_id: 'stim', 
//     exp_stage: 'calibration'
//   },
//   is_html: true,
//   choices: 'none',
//   response_ends_trial: false,
//   timing_stim: -1,
//   timing_response: 2000
// }

// var setLeftX = function(){
//   return Math.round(Math.random())
// }

// var setResponseStim = function(){
//   var stimulus = ''
//   if (setLeftX()){
//     stimulus = '<div class = "mark lft" id = "x-mark" style = "color:red">&#10005;</div><div class = "mark rght" id = "check-mark" style = "color:lime">&#10003;</div>'
//   } else {
//     stimulus = '<div class = "mark lft" id = "check-mark" style = "color:lime">&#10003;</div><div class = "mark rght" id = "x-mark" style = "color:red">&#10005;</div>'
//   }
//   return stimulus
// }

// var getLeftX = function(stimulus){
//   var left_x = 0
//   if($('.mark lft').id == 'x-mark'){ // check if this is the correct command to get id of the selected item
//     left_x = 1
//   }
//   return left_x  
// }

// var checkCriterion = function(data){

//   var val_diff = data.large_amt - 20

//   var criterion = false

//   if (data.later_del == 1 && val_diff <= 1){
//     criterion = true
//   } else if (data.later_del == 2 && val_diff <= 1.5){
//     criterion = true
//   } else if (data.later_del == 7 && val_diff <= 2){
//     criterion = true
//   } else if (data.later_del == 14 && val_diff <= 2){
//     criterion = true
//   } else if (data.later_del == 30 && val_diff <= 3){
//     criterion = true
//   } else if (data.later_del == 90 && val_diff <= 4){
//     criterion = true
//   } else if (data.later_del == 180 && val_diff <= 4){
//     criterion = true
//   }

//   return criterion
// }

// var calib_response_block = {
//   type: 'single-stim',
//   stimulus: setResponseStim, //not sure if this would work
//   is_html: true,
//   choices: [80,81],
//   data: {
//     trial_id: "response",
//     exp_stage: "calibration",
//     left_x: getLeftX(jsPsych.data.getLastTrialData().stimulus), // re-check how to determine this 
//     large_amt: , 
//     later_del: , // also trace
//   },
//   response_ends_trial: true,
//   timing_stim: -1,
//   timing_response: 2000, //how long to wait if no response
//   on_finish: function(data) {
    
//     var choice = false;
           
//     $('.jspsych-display-element').html('<div id = "jspsych-single-stim-stimulus"></div>')
//     $('#jspsych-single-stim-stimulus').append(data.stimulus)

//     if(data.key_press == 80){
//       $('.rght').css('border', '10px white solid')
//       if(data.left_x == 1){
//         choice = 'll'
//       } else if (data.left_x == 0){
//         choice = 'ss'
//       }
//     } 
//     else if (data.key_press == 81){
//       $('.lft').css('border', '10px white solid')
//       if(data.left_x == 1){
//         choice = 'ss'
//       } else if (data.left_x == 0){
//         choice ='ll'
//       }
//     }

//     setTimeout(function() {
//         $('.jspsych-display-element').html('');
//       }, 2000-data.rt); //how long after to clear display (however much is left from 2000 ms)

//     //check criterion for trace given choice
//     var criterion = checkCriterion(data)

//     jsPsych.data.addDataToLastTrial({
//       choice: choice
//       criterion: criterion
//     });
//   }
// }

// var getDataMatchingCondition = function(objectArray, property, value){
//   var tmp = []
//   for(var i = 0; i<objectArray.length; i++){
//     if (objectArray[i][property] == value){
//       tmp.push(objectArray[i])
//     }
//   }
//   return tmp
// }

// var calibration_node = {
  
//   //order of blocks that this node will go through 
//   timeline: [fixation_block, calib_stim_block, jitter_block, response_block],
  
//   /* This function defines stopping criteria */
//   loop_function: function(data) {

//     var traces = [1,2,7,14,30, 90, 180]
//     var criteria = 0 //not sureif i should define this here

//     //loop through the data of each trace
//     for (var i = 0; i < traces.length; i++) {
//       //get all data for a given trace
//       var traceData = getDataMatchingCondition(data, 'later_del', trace[i])
//       //see if there are any objects in this array for the given trace where the criterion is true
//       if (getDataMatchingCondition(traceData, 'criterion', true).length != 0){
//         //if yes the increase the criteria for that trace
//         criteria ++
//       }
//     }

//     //looping node termination conditions
//     //if not equal to 7 for all traces then return true and continue looping
//     if (criteria != 7) {
//       return true
//       //if all criteria are complete then return false and break out of loop
//     } else if (criteria == 7) {
//       return false
//     }
//   }
// }

// Indifference point calculation

// Check behavioral exclusion criteria

// Test block stimulus generation

// Peters & Büchel 2009:
// Based on the behavioral pretests, individual offers were
// computed for each participant to ensure that participants chose the de-
// layed/probabilistic offer in ?50% of trials. More specifically, the maxi-
// mumamount of the delayed/probabilistic option was set to €80, and the
// minimumamount was set to €20.5
// From this range of magnitudes, trials
// were constructed by selecting an equal, uniformly distributed number of
// offers with an estimated subjective value below and above the indiffer-
// ence point (based on the pretest data). In cases in which the indifference
// point was larger than €50, an equal number of trials with a subjective
// value below and above €50 were created
// Participants were instructed that the fixed, immediately available re-
// ward would not be displayed, and they would only be shown the alterna-
// tive delayed or probabilistic offer.Agreen dot was shown for 500ms(Fig.
// 1), signaling the start of the trial. Then, the delayed or probabilistic offer
// was shown for 2500 ms, followed by a red dot (jitter) that was shown for
// random duration between 3 and 7 s, drawn from a uniform distribution.
// Then, a red “X” and a green check mark were shown (randomly assigned
// to either side of the screen). Participants pressed the red X to choose the
// fixed reward of €20 and the check mark to choose the delayed/probabi-
// listic offer. After response feedback, another 3–7 s jitter preceded the start
// of the next trial.

// Tag generation

// Test instruction block

// Test block

// Thank you block

// Random reward selection block

// Debriefing block
var end_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "end_block"
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>Thank you for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0
};

// Post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post_task_block"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};


//Set up experiment
var episodic_tagging_experiment = []
episodic_tagging_experiment.push(instruction_node);
episodic_tagging_experiment.push(practice_instruct_block);
episodic_tagging_experiment.push(fixation_block);
episodic_tagging_experiment.push(practice_stim_block);
episodic_tagging_experiment.push(jitter_block);
episodic_tagging_experiment.push(practice_response_block);
episodic_tagging_experiment.push(test_instruct_block);
//episodic_tagging_experiment.push(calibration_node);
episodic_tagging_experiment.push(end_block);

