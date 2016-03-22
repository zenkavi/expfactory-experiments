/* ************************************ */
/* Define helper functions */
/* ************************************ */
function getDisplayElement() {
  $('<div class = display_stage_background></div>').appendTo('body')
  return $('<div class = display_stage></div>').appendTo('body')
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */

// task specific variables
//hard coded options in the amounts and order specified in Kirby and Marakovic (1996)
var options = {
  small_amt: [54, 55, 19, 31, 14, 47, 15, 25, 78, 40, 11, 67, 34, 27, 69, 49, 80, 24, 33, 28, 34,
    25, 41, 54, 54, 22, 20
  ],
  large_amt: [55, 75, 25, 85, 25, 50, 35, 60, 80, 55, 30, 75, 35, 50, 85, 60, 85, 35, 80, 30, 50,
    30, 75, 60, 80, 25, 55
  ],
  later_del: [117, 61, 53, 7, 19, 160, 13, 14, 192, 62, 7, 119, 186, 21, 91, 89, 157, 29, 14, 179,
    30, 80, 20, 111, 30, 136, 7
  ]
}

var stim_html = []

//loop through each option to create html
for (var i = 0; i < options.small_amt.length; i++) {
  stim_html[i] =
    "<div class = centerbox id='container'><p class = center-block-text>Please select the option that you would prefer pressing <strong>'q'</strong> for left <strong>'p'</strong> for right:</p><div class='table'><div class='row'><div id = 'option'><center><font color='green'>$" +
    options.small_amt[i] +
    "<br>today</font></center></div><div id = 'option'><center><font color='green'>$" + options.large_amt[
      i] + "<br>" + options.later_del[i] + " days</font></center></div></div></div></div>"
}

data_prop = []

for (var i = 0; i < options.small_amt.length; i++) {
  data_prop.push({
    small_amt: options.small_amt[i],
    large_amt: options.large_amt[i],
    later_del: options.later_del[i]
  });
}

trials = []

//used new features to include the stimulus properties in recorded data
for (var i = 0; i < stim_html.length; i++) { 
  trials.push({
    stimulus: stim_html[i],
    data: data_prop[i]
  });
}

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

// Welcome block

var feedback_instruct_text =
  'Welcome to the experiment. This experiment will take about 30 minutes. Press <strong>enter</strong> to begin.'
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

// Instructions block

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment you will be presented with two amounts of money to choose between. One of the options will be $20 available now. The other will be a variable amount available in the future. Your job is to indicate whether you prefer $20 now or the presented amount in the future.</p></div>',
    '<div class = centerbox><p class = block-text>You should indicate your <strong>true</strong> preference because at the end of the experiment a random trial will be chosen and you will receive a bonus payment proportional to the option you selected at the time point you chose.</p></div>',
  ],
  allow_keys: false,
  show_clickable_nav: true
};

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

// Practice block

// Calibration block
// In this task, subjects made repeated choices between 20€ available immediately and larger but delayed hypothetical amounts 
// of money (delays [days]: 1, 2, 7, 14, 30, 90, 180). The hypothetical rewards always amounted to at least 20.5€, 
// but without an upper limit. An adjusting-amount procedure was used such that, following two successive choices of 
// the delayed reward, the delayed amount was reduced, and following two successive choices of the immediate reward, 
// the delayed amount was increased in a step-wise manner. The algorithm terminated as soon as the difference between 
// accepted and rejected delayed amounts reached a delay-specific criterion [Criterion in €: 1.0 (1d), 1.5 (2d), 
// 2.0 (7d), 2.0 (14d), 3.0 (30d), 4.0 (90d), 4.0 (180d)]

// fixation block - stim block - response block - jitter block --> calibration node
// green_circle.png red_circle.png red_x.png green_check.png

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

///////////////////

var start_practice_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "practice_intro"
  },
  text: '<div class = centerbox><p class = center-block-text>Here is a sample trial. Your choice for this trial will not be included in your bonus payment.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  //timing_post_trial: 1000
};

var practice_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  stimulus: "<div class = centerbox id='container'><p class = center-block-text>Please select the option that you would prefer pressing <strong>'q'</strong> for left <strong>'p'</strong> for right:</p><div class='table'><div class='row'><div id = 'option'><center><font color='green'>$20<br>today</font></center></div><div id = 'option'><center><font color='green'>$25<br>5 days</font></center></div></div></div></div>",
  is_html: true,
  choices: [80,81],
  response_ends_trial: true, 
};

var start_test_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "test_intro"
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>You are now ready to begin the survey.</p><p class = center-block-text>Remember to indicate your <strong>true</strong> preferences.</p><p class = center-block-text>Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  //timing_post_trial: 1000
};

var test_block = {
  type: 'poldrack-single-stim',
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  timeline: trials,
  is_html: true,
  choices: [80,81],
  response_ends_trial: true,
  //used new feature to include choice info in recorded data
  on_finish: function(data) {
    var choice = false;
    if (data.key_press == 80) {
      choice = 'larger_later';
    } else if (data.key_press == 81) {
      choice = 'smaller_sooner';
    }
    jsPsych.data.addDataToLastTrial({
      choice: choice
    });
  }
};


//Set up experiment
var episodic_tagging_experiment = []
episodic_tagging_experiment.push(instruction_node);
episodic_tagging_experiment.push(start_practice_block);
episodic_tagging_experiment.push(practice_block);
episodic_tagging_experiment.push(attention_node);
episodic_tagging_experiment.push(start_test_block);
episodic_tagging_experiment.push(test_block);
episodic_tagging_experiment.push(attention_node);
episodic_tagging_experiment.push(post_task_block)
episodic_tagging_experiment.push(end_block);