/* ************************************ */
/* Define helper functions */
/* ************************************ */
function evalAttentionChecks() {
  var check_percent = 1
  if (run_attention_checks) {
    var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check')
    var checks_passed = 0
    for (var i = 0; i < attention_check_trials.length; i++) {
      if (attention_check_trials[i].correct === true) {
        checks_passed += 1
      }
    }
    check_percent = checks_passed / attention_check_trials.length
  }
  return check_percent
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.getTrialsOfType('poldrack-single-stim')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[32] = 0
	for (var i = 0; i < experiment_data.length; i++) {
		trial_count += 1
		rt = experiment_data[i].rt
		key = experiment_data[i].key_press
		choice_counts[key] += 1
		if (rt == -1) {
			missed_count += 1
		} else {
			rt_array.push(rt)
		}
	}
	//calculate average rt
	var sum = 0
	for (var j = 0; j < rt_array.length; j++) {
		sum += rt_array[j]
	}
	var avg_rt = sum / rt_array.length || -1
		//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	credit_var = (avg_rt > 200) && responses_ok
	jsPsych.data.addDataToLastTrial({"credit_var": credit_var})
}

var post_trial_gap = function() {
  gap = Math.floor(Math.random() * 500) + 500
  return gap;
}

/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function(data) {
  var correct = false
  if (data.key_press == data.correct_response) {
    correct = true
  }
  jsPsych.data.addDataToLastTrial({
    trial_num: current_trial,
    correct: correct
  })
  current_trial = current_trial + 1
}

var practice_index = 0
var getFeedback = function() {
  if (practice_trials[practice_index].key_answer == -1) {
    practice_index += 1
    return '<div class = centerbox><div style="color:green"; class = center-text>Correct!</div></div>'
  } else {
    practice_index += 1
    return '<div class = centerbox><div style="color:red"; class = center-text>Incorrect</div></p></div>'
  }
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = true

// task specific variables
var correct_responses = jsPsych.randomization.repeat([
  ['go', 32, 'respond by pressing the spacebar as quickly as possible'],
  ['nogo', -1, 'not respond']
], 1)
var gap = 0
var current_trial = 0
var practice_stimuli = [{
  stimulus: '<div class = centerbox><div  id = "stim1"></div></div>',
  data: {
    correct_response: correct_responses[0][1],
    condition: correct_responses[0][0],
    trial_id: 'practice'
  },
  key_answer: correct_responses[0][1]
}, {
  stimulus: '<div class = centerbox><div id = "stim2"></div></div>',
  data: {
    correct_response: correct_responses[1][1],
    condition: correct_responses[1][0],
    trial_id: 'practice'
  },
  key_answer: correct_responses[1][1]
}];


//set up block stim. test_stim_responses indexed by [block][stim][type]
var test_stimuli_block = [{
  stimulus: '<div class = centerbox><div  id = "stim1"></div></div>',
  data: {
    correct_response: correct_responses[0][1],
    condition: correct_responses[0][0],
    trial_id: 'test_block'
  }
}, {
  stimulus: '<div class = centerbox><div id = "stim2"></div></div>',
  data: {
    correct_response: correct_responses[1][1],
    condition: correct_responses[1][0],
    trial_id: 'test_block'
  }
}];



var practice_trials = jsPsych.randomization.repeat(practice_stimuli, 5); 
var test_trials = jsPsych.randomization.repeat(test_stimuli_block, 50);   



/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: "attention_check"
  },
  timing_response: 180000,
  response_ends_trial: true,
  timing_post_trial: 200
}

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
}

//Set up post task questionnaire
var post_task_block = {
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};

/* define static blocks */
var feedback_instruct_text =
  'Welcome to the experiment. This task will take around 7 minutes. Press <strong>enter</strong> to begin.'
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
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  data: {
    trial_id: "instruction"
  },
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment blue and orange squares will appear on the screen. You will be told to respond to one of the colored squares by pressing the spacebar. You should only respond to this color and withhold any response to the other color.</p><p class = block-text>If you see the <font color="orange">orange</font> square you should <strong>' +
    correct_responses[0][2] +
    '</strong>. If you see the <font color="blue">blue</font> square you should <strong>' +
    correct_responses[1][2] +
    '</strong>.</p><p class = block-text>We will begin with practice. You will get feedback telling you if you were correct.</p></div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
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

var end_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "end",
    exp_id: 'go_nogo'
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: assessPerformance
};

var start_test_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "test_intro"
  },
  text: '<div class = centerbox><p class = block-text>Practice is over, we will now begin the experiment. You will no longer get feedback about your responses.</p><p class = block-text>Remember, if you see the <font color="orange">orange</font> square you should <strong>' +
    correct_responses[0][2] +
    '</strong>. If you see the <font color="blue">blue</font> square you should <strong>' +
    correct_responses[1][2] +
    '</strong>. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000
};

var reset_block = {
  type: 'call-function',
  data: {
    trial_id: "reset_trial"
  },
  func: function() {
    current_trial = 0
  },
  timing_post_trial: 0
}


/* define practice block */
var practice_block = {
  type: 'poldrack-categorize',
  timeline: practice_trials,
  is_html: true,
  data: {
    trial_id: "stim",
    exp_stage: "practice"
  },
  correct_text: '<div class = centerbox><div style="color:green"; class = center-text>Correct!</div></div>',
  incorrect_text: '<div class = centerbox><div style="color:red"; class = center-text>Incorrect</div></div>',
  timeout_message: getFeedback,
  choices: [32],
  timing_response: 2000,
  timing_stim: 2000,
  timing_feedback_duration: 1000,
  show_stim_with_feedback: false,
  timing_post_trial: post_trial_gap,
  on_finish: appendData
}

/* define test block */
var test_block = {
  type: 'poldrack-single-stim',
  timeline: test_trials,
  data: {
    trial_id: "stim",
    exp_stage: "test"
  },
  is_html: true,
  choices: [32],
  timing_response: 2000,
  timing_post_trial: post_trial_gap,
  on_finish: appendData
};



/* create experiment definition array */
var go_nogo_experiment = [];
go_nogo_experiment.push(instruction_node);
go_nogo_experiment.push(practice_block);
go_nogo_experiment.push(attention_node)
go_nogo_experiment.push(reset_block)
go_nogo_experiment.push(start_test_block);
go_nogo_experiment.push(test_block);
go_nogo_experiment.push(attention_node)
go_nogo_experiment.push(post_task_block)
go_nogo_experiment.push(end_block)