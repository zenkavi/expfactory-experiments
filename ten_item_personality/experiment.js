
/* ************************************ */
/* Define helper functions */
/* ************************************ */
function getDisplayElement () {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function fillArray(value, len) {
  if (len === 0) return [];
  var a = [value];
  while (a.length * 2 <= len) a = a.concat(a);
  if (a.length < len) a = a.concat(a.slice(0, len - a.length));
  return a;
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */

/* define static blocks */

var welcome_block = {
  type: 'text',
  text: '<div class = centerbox><p class = block-text>Welcome to this survey. Press <strong>enter</strong> to begin.</p></div>',
  cont_key: [13]
};

var instructions_block = {
  type: 'instructions',
  pages: [
    '<div class = centerbox><p class = block-text>Please indicate to what degree you agree with each of the following statements.<br><br> Press <strong>enter</strong> to begin.</p></div>',
  ],
  key_forward: 13,
  allow_backwards: false
};

var opts = ["Disagree strongly","Disagree moderately","Disagree a little","Neither agree nor disagree","Agree a little","Agree moderately","Agree strongly"]

var all_pages = [["Extraverted, enthusiastic.","Critical, quarrelsome.","Dependable, self-disciplined.","Anxious, easily upset.","Open to new experiences, complex.","Reserved, quiet.","Sympathetic, warm.","Disorganized, careless.","Calm, emotionally stable.","Conventional, uncreative."]]

var all_options = [fillArray(opts, 10)]

var score_scale = {"Disagree strongly":1,"Disagree moderately":2,"Disagree a little":3,"Neither agree nor disagree":4,"Agree a little":5,"Agree moderately":6,"Agree strongly":7}

var survey_block = {
  type: "poldrack-survey-multi-choice",
  horizontal: true,
  preamble: '<p><strong>I see myself as:</strong></p>',
  pages: all_pages,
  options: all_options,
  scale: score_scale,
  show_clickable_nav: true,
  allow_backward: true,
  required: [fillArray(true, 10)],
  reverse_score: [[false, true, false, true, false, true, false, true, false, true]]
};

var end_block = {
  type: 'text',
  text: '<div class = centerbox><p class = center-block-text>Congratulations for completing this task!</p><p class = center-block-text>Press <strong>enter</strong> to continue.</p></div>',
  cont_key: [13]
};

//Set up experiment
var ten_item_personality_experiment = []
ten_item_personality_experiment.push(welcome_block);
ten_item_personality_experiment.push(instructions_block);
ten_item_personality_experiment.push(survey_block);
ten_item_personality_experiment.push(end_block);
