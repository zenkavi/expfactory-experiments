/* ************************************ */
/* Define helper functions */
/* ************************************ */
function getDisplayElement() {
  $('<div class = display_stage_background></div>').appendTo('body')
  return $('<div class = display_stage></div>').appendTo('body')
}

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

function addID() {
  jsPsych.data.addDataToLastTrial({
    'exp_id': 'bickel_titrator'
  })
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
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
	for (var k = 0; k < choices.length; k++) {
    choice_counts[choices[k]] = 0
  }
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
	var avg_rt = sum / rt_array.length
		//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	credit_var = (avg_rt > 200) && responses_ok
}

var getStim = function() {
  var immediate_stim;
  var delayed_stim;
  var immediate_display = immediate_amount.toFixed([2]).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')
  var delayed_display = delayed_amount.toFixed([2]).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',')
  if (Math.random() < 0.5) {
    immediate_stim = '<div class = bickel_leftBox><div class = center-text> $' + immediate_display +
      ' immediately</div></div>'
    delayed_stim = '<div class = bickel_rightBox><div class = center-text> $' + delayed_display +
      ' in ' + curr_delay + '</p></div>'
    displayed_amounts = [immediate_amount, delayed_amount] // in order from left to right
  } else {
    immediate_stim = '<div class = bickel_rightBox><div class = center-text> $' +
      immediate_display + ' immediately</div></div>'
    delayed_stim = '<div class = bickel_leftBox><div class = center-text> $' + delayed_display +
      ' in ' + curr_delay + '</div></div>'
    displayed_amounts = [delayed_amount, immediate_amount] // in order from left to right
  }
  return immediate_stim + delayed_stim
}


var updateAmount = function(choice) {
  if (choice == 'delayed') {
    immediate_amount += step
  } else {
    immediate_amount -= step
  }
  step /= 2
}

var updateDelay = function() {
  step = original_immediate/2
  immediate_amount = original_immediate
  delayed_amount = original_delayed
  curr_delay = delays.shift()
  curr_delay_in_minutes = convertToMins(curr_delay)
}

var post_trial_gap = function() {
  var curr_trial = jsPsych.progress().current_trial_global
  var gap = 2000 - jsPsych.data.getData()[curr_trial - 1].rt
  if (gap < 0) {
    gap = 1000
  }
  return gap

}

var convertToMins = function(time) {
  switch (time) {
    case '1 day':
      return 1
      break;
    case '1 week':
      return 7
      break;
    case '1 month':
      return 30
      break;
    case '60 months':
      return 180
      break;
    case '1 year':
      return 365
      break;
    case '5 years':
      return 1825
      break;
    case '25 years':
      return 9125
      break;
  }
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var delays = jsPsych.randomization.shuffle(['1 day', '1 week', '1 month', '6 months', '1 year',
  '5 years', '25 years'
])
var magnitudes = jsPsych.randomization.shuffle([10, 1000, 1000000])
var choices = [37, 39]
var curr_delay = delays.shift()
var curr_delay_in_minutes = convertToMins(curr_delay)
var original_immediate = 0
var original_delayed = 0
var immediate_amount = 0
var delayed_amount = 0
var displayed_amounts = []
var step = 250
  /* ************************************ */
  /* Set up jsPsych blocks */
  /* ************************************ */
  // Set up attention check node
var attention_check_block = {
  type: 'attention-check',
  data: {
    trial_id: 'attention_check'
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
  'Welcome to the experiment. This task will take around 5 minutes. Press <strong>enter</strong> to begin.'
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  text: getInstructFeedback,
  data: {
    trial_id: 'instruction'
  },
  timing_post_trial: 0,
  timing_response: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment you will be presented with two amounts of money to choose between. These amounts will be available at different time points. Your job is to indicate which option you would prefer by pressing the left or right arrow key to indicate your choice.</p><p class = block-text>You should indicate your <strong>true</strong> preference because at the end of the experiment a random trial will be chosen and you will receive a bonus payment proportional to the option you selected at the time point you chose.</p><p class = block-text>We will start after instructions end.</p></div>',
  ],
  allow_keys: false,
  data: {
    trial_id: 'instruction'
  },
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

var update_delay_block = {
  type: 'call-function',
  data: {
    trial_id: 'update_delay'
  },
  func: function() {
    updateDelay()
  },
  timing_post_trial: 0
}

var update_mag_block = {
  type: 'call-function',
  data: {
    trial_id: 'update_mag'
  },
  func: function() {
    original_delayed = magnitudes.shift()
    original_immediate = original_delayed/2
  },
  timing_post_trial: 0
}

var test_block = {
  type: 'poldrack-single-stim',
  stimulus: getStim,
  data: {
    trial_id: 'stim',
    exp_stage: 'test'
  },
  is_html: true,
  choices: choices,
  response_ends_trial: true,
  on_finish: function(data) {
    var choice;
    var choice_i = choices.indexOf(data.key_press)
    if (displayed_amounts[choice_i] == original_delayed) {
      choice = 'delayed'
    } else {
      choice = 'immediate'
    }
    jsPsych.data.addDataToLastTrial({
      'sooner_amount': immediate_amount,
      'later_amount': delayed_amount,
      'sooner_time_days': 0,
      'later_time_days': curr_delay_in_minutes,
      'choice': choice
    })
    updateAmount(choice)
  },
  timing_post_trial: 0
};

var gap_block = {
    type: 'poldrack-single-stim',
    stimulus: ' ',
    is_html: true,
    choices: 'none',
    data: {

      trial_id: 'gap',
      exp_stage: 'test'
    },
    timing_post_trial: 0,
    timing_stim: post_trial_gap,
    timing_response: post_trial_gap,
  }

var end_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: 'end'
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0,
  on_finish: assessPerformance
};


//Set up experiment
var bickel_titrator_experiment = []
bickel_titrator_experiment.push(instruction_node);

for (var k = 0; k < magnitudes.length; k++) {
  bickel_titrator_experiment.push(update_mag_block);
  for (var i = 0; i < delays.length; i++) {
    bickel_titrator_experiment.push(update_delay_block);
    for (var j = 0; j < 5; j++) {
      bickel_titrator_experiment.push(test_block);
      bickel_titrator_experiment.push(gap_block);
    }
    if ($.inArray(i, [0, 3, 5]) != -1) {
      bickel_titrator_experiment.push(attention_node)
    }
  }
}
bickel_titrator_experiment.push(post_task_block)
bickel_titrator_experiment.push(end_block)