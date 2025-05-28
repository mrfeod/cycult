let currentQuestion = 0;
let correctCount = 0;
let incorrectCount = 0;
const buttonsCount = 4;

const Mode = {
  Learn: 'Learn',
  Test: 'Test',
};

function setElementText(elementId, text) {
  return document.getElementById(elementId).innerText = text;
}

function toggleModifier(elementId, modifier, force) {
  document.getElementById(elementId).classList.toggle(modifier, force);
}

function hideSpacers(hide) {
  var elements = document.getElementsByClassName('spacer');
  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.toggle('d-hide', hide);
  }
}

function disableAnswerButtons() {
  for (let i = 0; i < buttonsCount; i++) {
    toggleModifier('answerButton' + i, 'disabled', true);
  }
}

function enableAnswerButtons() {
  for (let i = 0; i < buttonsCount; i++) {
    toggleModifier('answerButton' + i, 'btn-success', false);
    toggleModifier('answerButton' + i, 'btn-error', false);
    toggleModifier('answerButton' + i, 'disabled', false);
  }
}

function showAnswer() {
  toggleModifier('answerText', 'd-invisible', false);
}

function updateScore() {
  setElementText('question', currentQuestion);
  setElementText('correct', correctCount);
  setElementText('incorrect', incorrectCount);
}

function proceed() {
  return currentQuestion < questions.length;
}

function getRandomQuestion() {
  let availableQuestions = questions.filter(question => !question.used);
  if (availableQuestions.length === 0) {
    questions.forEach(question => question.used = false);
    availableQuestions = questions;
  }
  let randomIndex = Math.floor(Math.random() * availableQuestions.length);
  let question = availableQuestions[randomIndex];
  question.used = true;
  return question;
}

function assignAnswer(element, answer) {
  element.innerText = answer.answer;
  element.answer = answer.answer;
  element.translation = answer.translation ? answer.translation : undefined;
}

function showQuestion() {
  const question = getRandomQuestion();
  let questionText = document.getElementById('questionText');
  questionText.question = question.question;
  questionText.translation = question.translation ? question.translation : undefined;
  questionText.innerText = question.question;

  const mode = document.getElementById('mode').checked ? Mode.Test : Mode.Learn;
  toggleModifier('score', 'd-hide', mode === Mode.Test);
  toggleModifier('answers', 'd-hide', mode === Mode.Test);
  toggleModifier('answerText', 'd-hide', mode === Mode.Learn);
  toggleModifier('showAnswerButton', 'd-hide', mode === Mode.Learn);
  hideSpacers(mode === Mode.Learn);

  if (mode === Mode.Test) {
    toggleModifier('answerText', 'd-invisible', true);
    assignAnswer(document.getElementById('answerText'), question.answers.find(a => a.correct));
  } else if (mode === Mode.Learn) {
    answers = question.answers;
    if (answers.size > 2) {
      answers.sort(() => Math.random() - 0.5);
    }

    const answerIndex = answers.findIndex(a => a.correct);
    for (let i = 0; i < buttonsCount; i++) {
      if (i >= answers.length) {
        toggleModifier('answerButton' + i, 'd-hide', true);
        continue;
      }
      toggleModifier('answerButton' + i, 'd-hide', false);

      let button = document.getElementById('answerButton' + i);
      assignAnswer(button, answers[i]);
      button.onclick = function () {
        disableAnswerButtons();
        let theAnswer = document.getElementById('answerButton' + answerIndex);
        theAnswer.classList.add('btn-success');
        if (button === theAnswer) {
          correctCount++;
          if (proceed()) {
            setTimeout(nextQuestion, 150);
          }
        } else {
          incorrectCount++;
          button.classList.add('btn-error');
        }
        updateScore();
        document.getElementById('nextButton').focus();

        if (!proceed()) {
          nextQuestion();
        }
      };
    }
  }
  updateTranslation();
}

function nextQuestion() {
  setElementText('nextButton', proceed() ? 'Επόμενη' : 'Πάλι');
  toggleModifier('finishText', 'd-hide', proceed());
  toggleModifier('questionText', 'd-hide', !proceed());
  if (proceed()) {
    currentQuestion++;
    updateScore();
    showQuestion();
    enableAnswerButtons();
  } else {
    disableAnswerButtons();
    resetState();
  }
}

function resetState() {
  currentQuestion = 0;
  correctCount = 0;
  incorrectCount = 0;
  questions.forEach(question => question.used = false);
}

function switchMode() {
  resetState();
  nextQuestion();
}

function updateTranslation() {
  let ru = document.getElementById('lang').checked;
  for (let i = 0; i < buttonsCount; i++) {
    let button = document.getElementById('answerButton' + i);
    button.innerText = ru && button.translation !== undefined ? button.translation : button.answer;
  }
  let questionText = document.getElementById('questionText');
  questionText.innerText = ru && questionText.translation !== undefined ? questionText.translation : questionText.question;
  let answerText = document.getElementById('answerText');
  answerText.innerText = ru && answerText.translation !== undefined ? answerText.translation : answerText.answer;
}

setElementText('total', questions.length);
nextQuestion();