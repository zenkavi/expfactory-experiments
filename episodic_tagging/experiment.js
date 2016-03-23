/* ************************************ */
/* Define helper functions */
/* ************************************ */
function getDisplayElement() {
  $('<div class = display_stage_background></div>').appendTo('body')
  return $('<div class = display_stage></div>').appendTo('body')
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +'</p></div>'
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
    '<div class = centerbox><p class = block-text>In this experiment you will be presented with two amounts of money to choose between. One of the options will be $20 available now. The other will be a variable amount available in the future. Your job is to indicate whether you prefer $20 now or the larger amount in the future.</p><p class = block-text>When making your choices you will only see the larger amount available in the future on the screen. The other option, $20 now, will not be shown.</p></div>',
    '<div class = centerbox><p class = block-text>After seeing the larger amount of money available in the future you will be presented with a <font color: "red">red X</font> and a <font color: "green">green check</font>.</p><p class = block-text>You should choose the <font color: "red">red X</font> if you reject the amount you have seen and prefer $20 now. On the other hand, you should select the <font color: "green">green check</font> if you prefer the amount you have seen.</p></div>',
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

// Let's start with an example trial
// Please indicate your choice between $20 now and the amount you will see on the screen
// Fix - stimulus - jitter - x/check 
// You have chosen: ...
// Press enter to continue

var practice_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  data: {
    trial_id: "instruction"
  },
  text: "<div class = centerbox><p class = block-text>Let's start with an example trial. Please indicate your choice between $20 now and the amount you will see on the screen.</p></div>",
  timing_post_trial: 0,
  timing_response: 180000
};

var fixation_block = {

}

var path_source = '/static/experiments/episodic_tagging/images/'

var fixation_block = {
  type: 'poldrack-single-stim',
  stimulus: '<img src =' + path_source + 'green_circle.png </img>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "fixation",
    exp_stage: "practice"
  },
  response_ends_trial: false,
  timing_stim: 500,
  timing_post_trial: 0
}

var practice_stims = []

practice_stims.push({
    stimulus: '<div class = centerbox><div class = stimBox><p style="font-size:24px">$26</p><br><p style="font-size:24px">30 days</p></div></div>',
    data: {large_amt: 26, later_del: 30, trial_id: 'stim', exp_stage: 'practice'}
  })

var practice_stim_block = {
  type: 'poldrack-single-stim',
  timeline: practice_stims,
  is_html: true,
  choices: 'none',
  response_ends_trial: false,
  timing_stim: 2000,
  timing_post_trial: 0
}

var getJitterLength = function() {
  return 3000 + Math.random() * 4000
}

var jitter_block = {
  type: 'poldrack-single-stim',
  stimulus: '<img src =' + path_source + 'red_circle.png </img>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "fixation",
    exp_stage: "practice"
  },
  response_ends_trial: false,
  timing_stim: getJitterLength,
  timing_post_trial: 0
}

//make the x and the check appear in two boxes (div's)
//on click change border of that box
//on click also get value of that box
var response_block = {

}

//get rid of this if the box 
var feedback_block = {

}


var practice_loop_node = {
  timeline: [fixation_block, practice_stim_block, jitter_block, response_block, feedback_block, jitter_block],
  loop_function: function(data) {
    if (practice_stims.stimulus.length > 0) {
      return true;
    } else {
      return false;
    }
  }
}

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


//Set up experiment
var episodic_tagging_experiment = []
episodic_tagging_experiment.push(instruction_node);
episodic_tagging_experiment.push(start_practice_block);

episodic_tagging_experiment.push(end_block);
episodic_tagging_experiment.push(post_task_block);
