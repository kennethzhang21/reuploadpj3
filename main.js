let studentName = '';
let currentQuizId = 1;
let currentQuestionId = 1;
let score = 0;
let totalQuestions = 5;
let timer = 0;
let interval;

document.addEventListener('DOMContentLoaded', () => {
  renderTemplate('home-template', {});

  document.addEventListener('click', handleClick);
});

function handleClick(e) {
  if (e.target.id === 'start-btn') {
    studentName = document.getElementById('name-input').value.trim();
    currentQuizId = document.getElementById('quiz-select').value;
    if (studentName && currentQuizId) {
      currentQuestionId = 1;
      score = 0;
      timer = 0;
      startTimer();
      loadQuestion();
    }
  } else if (e.target.id === 'submit-answer') {
    const answer = document.getElementById('answer-input').value.trim();
    checkAnswer(answer);
  } else if (e.target.classList.contains('choice-btn') || e.target.classList.contains('img-choice')) {
    const answer = e.target.dataset.value;
    checkAnswer(answer);
  } else if (e.target.id === 'got-it-btn') {
    currentQuestionId++;
    loadQuestion();
  } else if (e.target.id === 'retry-btn') {
    currentQuestionId = 1;
    score = 0;
    timer = 0;
    startTimer();
    loadQuestion();
  } else if (e.target.id === 'home-btn') {
    stopTimer();
    renderTemplate('home-template', {});
  }
}

async function loadQuestion() {
  if (currentQuestionId > totalQuestions) {
    stopTimer();
    const passed = (score / totalQuestions) >= 0.8;
    renderTemplate('result-template', {
      name: studentName,
      score: Math.round((score / totalQuestions) * 100),
      passed
    });
    return;
  }

  const res = await fetch(`https://my-json-server.typicode.com/<your-username>/<repo>/quiz${currentQuizId}/${currentQuestionId}`);
  const data = await res.json();

  renderTemplate('quiz-template', {
    ...data,
    isMultipleChoice: data.type === "multipleChoice",
    isTextInput: data.type === "textInput",
    isImageChoice: data.type === "imageChoice",
    answered: currentQuestionId - 1,
    score: Math.round((score / (currentQuestionId - 1 || 1)) * 100),
    time: timer
  });
}

function checkAnswer(userAnswer) {
  fetch(`https://my-json-server.typicode.com/<your-username>/<repo>/quiz${currentQuizId}/${currentQuestionId}`)
    .then(res => res.json())
    .then(data => {
      if (userAnswer === data.correctAnswer) {
        score++;
        const msg = document.createElement('div');
        msg.className = "alert alert-success";
        msg.innerText = "Brilliant!";
        document.getElementById('app').appendChild(msg);
        setTimeout(() => {
          msg.remove();
          currentQuestionId++;
          loadQuestion();
        }, 1000);
      } else {
        renderTemplate('feedback-template', {
          correctAnswer: data.correctAnswer,
          explanation: data.explanation
        });
      }
    });
}

function renderTemplate(templateId, data) {
  const templateSrc = document.getElementById(templateId).innerHTML;
  const template = Handlebars.compile(templateSrc);
  document.getElementById('app').innerHTML = template(data);
}

function startTimer() {
  interval = setInterval(() => {
    timer++;
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = timer;
  }, 1000);
}

function stopTimer() {
  clearInterval(interval);
}
