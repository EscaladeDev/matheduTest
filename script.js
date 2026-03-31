const courseData = {
  course: "College Algebra",
  week: "Week 1",
  topic: "Algebraic Operations",
  questions: [
    {
      topic: "Classifying Real Numbers",
      prompt: "Which of the following numbers is a natural number?",
      options: [
        { letter: "A", text: "0" },
        { letter: "B", text: "−5" },
        { letter: "C", text: "7" },
        { letter: "D", text: "1/2" },
      ],
      correctAnswer: "C",
      explanation:
        "Natural numbers are the counting numbers: 1, 2, 3, and so on. In this course framing, 0 is whole but not natural, negatives are not natural, and fractions are not natural.",
    },
  ],
};

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("in-view"));
}

const questionText = document.getElementById("question-text");
const answerGrid = document.getElementById("answer-grid");
const submitButton = document.getElementById("submit-answer");
const nextButton = document.getElementById("next-question");
const prevButton = document.getElementById("prev-question");
const restartButton = document.getElementById("restart-quiz");
const feedbackPanel = document.getElementById("feedback-panel");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackSummary = document.getElementById("feedback-summary");
const feedbackExplanation = document.getElementById("feedback-explanation");
const stepLabel = document.getElementById("quiz-step-label");
const topicLabel = document.getElementById("quiz-topic-label");
const scorePill = document.getElementById("quiz-score-pill");
const progressFill = document.getElementById("progress-fill");

const hasQuiz = questionText && answerGrid && submitButton && nextButton && prevButton && restartButton && feedbackPanel && feedbackIcon && feedbackTitle && feedbackSummary && feedbackExplanation && stepLabel && topicLabel && scorePill && progressFill;

let currentQuestionIndex = 0;
let selectedAnswer = null;
let revealed = false;
const answersState = courseData.questions.map(() => ({ selected: null, correct: null }));

function renderQuestion(index) {
  const question = courseData.questions[index];
  const state = answersState[index];
  selectedAnswer = state.selected;
  revealed = state.correct !== null;

  questionText.textContent = question.prompt;
  topicLabel.textContent = question.topic;
  stepLabel.textContent = `Question ${index + 1} of ${courseData.questions.length}`;

  answerGrid.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.setAttribute("role", "radio");
    button.setAttribute("aria-checked", String(selectedAnswer === option.letter));
    button.dataset.letter = option.letter;

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = option.letter;

    const copy = document.createElement("span");
    copy.className = "answer-copy";
    copy.textContent = option.text;

    button.append(letter, copy);

    if (selectedAnswer === option.letter) {
      button.classList.add("is-selected");
    }

    if (revealed) {
      button.disabled = true;
      if (option.letter === question.correctAnswer) {
        button.classList.add("is-correct");
      } else if (selectedAnswer === option.letter && selectedAnswer !== question.correctAnswer) {
        button.classList.add("is-incorrect");
      }
    } else {
      button.addEventListener("click", () => {
        selectedAnswer = option.letter;
        answersState[index].selected = option.letter;
        renderQuestion(index);
      });
    }

    answerGrid.appendChild(button);
  });

  updateControls();
  updateFeedback(question, state);
  updateProgress();
}

function updateControls() {
  prevButton.disabled = currentQuestionIndex === 0;
  submitButton.disabled = !selectedAnswer || revealed;

  const isLastQuestion = currentQuestionIndex === courseData.questions.length - 1;
  nextButton.classList.toggle("is-hidden", !revealed);
  nextButton.textContent = isLastQuestion ? "Finish" : "Next";
}

function updateFeedback(question, state) {
  if (!revealed) {
    feedbackPanel.className = "feedback-panel is-hidden";
    return;
  }

  const isCorrect = state.correct === true;
  feedbackPanel.className = `feedback-panel ${isCorrect ? "is-correct" : "is-incorrect"}`;
  feedbackIcon.textContent = isCorrect ? "task_alt" : "cancel";
  feedbackTitle.textContent = isCorrect ? "Nice work" : "Not quite";
  feedbackSummary.textContent = isCorrect
    ? `You chose ${state.selected}, which is correct.`
    : `You chose ${state.selected}. The correct answer is ${question.correctAnswer}.`;
  feedbackExplanation.textContent = question.explanation;
}

function updateProgress() {
  const answeredCount = answersState.filter((entry) => entry.correct !== null).length;
  const correctCount = answersState.filter((entry) => entry.correct === true).length;
  const percent = ((currentQuestionIndex + 1) / courseData.questions.length) * 100;

  progressFill.style.width = `${percent}%`;

  if (answeredCount === 0) {
    scorePill.textContent = "Not answered yet";
    return;
  }

  scorePill.textContent = `${correctCount} / ${answeredCount} correct`;
}

if (hasQuiz) {
submitButton.addEventListener("click", () => {
  const question = courseData.questions[currentQuestionIndex];
  if (!selectedAnswer) return;

  const isCorrect = selectedAnswer === question.correctAnswer;
  answersState[currentQuestionIndex] = {
    selected: selectedAnswer,
    correct: isCorrect,
  };
  revealed = true;
  renderQuestion(currentQuestionIndex);
});

nextButton.addEventListener("click", () => {
  const isLastQuestion = currentQuestionIndex === courseData.questions.length - 1;

  if (isLastQuestion) {
    feedbackPanel.className = "feedback-panel is-correct";
    feedbackIcon.textContent = "emoji_events";
    feedbackTitle.textContent = "Quiz complete";
    feedbackSummary.textContent = `${answersState.filter((entry) => entry.correct === true).length} of ${courseData.questions.length} answered correctly.`;
    feedbackExplanation.textContent = "Review the explanation, then revisit OpenStax Section 1.1 and the classification tree examples if needed.";
    nextButton.classList.add("is-hidden");
    submitButton.disabled = true;
    return;
  }

  currentQuestionIndex += 1;
  renderQuestion(currentQuestionIndex);
});

prevButton.addEventListener("click", () => {
  if (currentQuestionIndex === 0) return;
  currentQuestionIndex -= 1;
  renderQuestion(currentQuestionIndex);
});

restartButton.addEventListener("click", () => {
  currentQuestionIndex = 0;
  selectedAnswer = null;
  revealed = false;
  for (let i = 0; i < answersState.length; i += 1) {
    answersState[i] = { selected: null, correct: null };
  }
  renderQuestion(currentQuestionIndex);
});

renderQuestion(currentQuestionIndex);
}
