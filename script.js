const magnetButtons = document.querySelectorAll('.magnet-button');

magnetButtons.forEach((button) => {
  button.addEventListener('mousemove', (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const moveX = ((x / rect.width) - 0.5) * 10;
    const moveY = ((y / rect.height) - 0.5) * 8;

    button.style.transform = `translate(${moveX}px, ${moveY - 2}px) scale(1.02)`;
  });

  ['mouseleave', 'blur'].forEach((eventName) => {
    button.addEventListener(eventName, () => {
      button.style.transform = '';
    });
  });
});

const form = document.getElementById('email-form');
const emailInput = document.getElementById('email');
const formMessage = document.getElementById('form-message');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  formMessage.className = 'form-message';

  if (!isValid) {
    formMessage.textContent = 'Please enter a valid email address.';
    formMessage.classList.add('error');
    emailInput.focus();
    return;
  }

  formMessage.textContent = `Thanks — course info is ready to send to ${email}.`;
  formMessage.classList.add('success');
  form.reset();
});

const revealItems = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('in-view'));
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero-media');
const heroContent = document.querySelector('.hero-content');
const topbar = document.querySelector('.topbar');

const updateHeroDepth = () => {
  if (reduceMotion || !hero || !heroMedia || !heroContent || !topbar) return;

  const rect = hero.getBoundingClientRect();
  const heroHeight = rect.height || 1;
  const progress = Math.min(1, Math.max(0, -rect.top / heroHeight));

  const mediaShift = progress * 82;
  const contentShift = progress * 22;
  const topbarShift = progress * 10;

  heroMedia.style.setProperty('--hero-media-shift', `${mediaShift}px`);
  heroContent.style.setProperty('--hero-content-shift', `${contentShift}px`);
  topbar.style.setProperty('--hero-topbar-shift', `${topbarShift}px`);
};

updateHeroDepth();
window.addEventListener('scroll', updateHeroDepth, { passive: true });
window.addEventListener('resize', updateHeroDepth);

const videoDrawer = document.getElementById('video-drawer');
const videoToggle = document.getElementById('video-toggle');
const videoClose = document.getElementById('video-close');
const videoPanel = document.getElementById('video-panel');
const overviewVideo = document.getElementById('overview-video');

const setVideoState = (isOpen) => {
  videoDrawer.classList.toggle('is-open', isOpen);
  videoToggle.setAttribute('aria-expanded', String(isOpen));
  videoPanel.setAttribute('aria-hidden', String(!isOpen));

  if (!isOpen && overviewVideo) {
    overviewVideo.pause();
  }
};

videoToggle?.addEventListener('click', () => {
  const isOpen = !videoDrawer.classList.contains('is-open');
  setVideoState(isOpen);
});

videoClose?.addEventListener('click', () => {
  setVideoState(false);
});

const courses = {
  mathematics: {
    title: 'College Mathematics',
    credits: '3 credits',
    icon: 'calculate',
    topics: [
      'Algebra and Functions',
      'Counting and Probability',
      'Data Analysis and Statistics',
      'Financial Mathematics',
      'Geometry',
      'Logic and Sets',
      'Numbers',
    ],
  },
  algebra: {
    title: 'College Algebra',
    credits: '3 credits',
    icon: 'functions',
    topics: [
      'Algebraic operations',
      'Equations and inequalities',
      'Functions and their properties',
      'Number systems and operations',
    ],
  },
  precalculus: {
    title: 'College Precalculus',
    credits: '3 credits',
    icon: 'query_stats',
    topics: [
      'Algebraic Expressions, Equations, and Inequalities',
      'Functions: Concept, Properties, and Operations',
      'Representations of Functions: Symbolic, Graphical, and Tabular',
      'Analytic Geometry',
      'Trigonometry and its Applications',
      'Functions as Models',
    ],
  },
  calculus: {
    title: 'College Calculus',
    credits: '3 credits',
    icon: 'show_chart',
    topics: [
      'Limits',
      'Differential Calculus',
      'Integral Calculus',
    ],
  },
};

const courseButtons = document.querySelectorAll('.course-card');
const courseGrid = document.querySelector('.course-grid');
const courseDetails = document.getElementById('course-details');
const detailTitle = document.getElementById('detail-title');
const detailMeta = document.getElementById('detail-meta');
const detailIcon = document.getElementById('detail-icon');
const topicList = document.getElementById('topic-list');
const mobileCourseLayout = window.matchMedia('(max-width: 560px)');
let activeCourseKey = null;

const renderCourseDetails = (courseKey) => {
  const course = courses[courseKey];
  if (!course) return;

  detailTitle.textContent = course.title;
  detailMeta.textContent = course.credits;
  detailIcon.textContent = course.icon;
  topicList.innerHTML = '';

  course.topics.forEach((topic) => {
    const li = document.createElement('li');
    li.textContent = topic;
    topicList.appendChild(li);
  });

  courseDetails.classList.remove('is-refresh');
  void courseDetails.offsetWidth;
  courseDetails.classList.add('is-refresh');
};

const placeCourseDetails = (courseKey) => {
  const activeButton = Array.from(courseButtons).find((button) => button.dataset.course === courseKey);
  if (!activeButton || !courseGrid || !courseDetails) return;

  if (mobileCourseLayout.matches) {
    activeButton.insertAdjacentElement('afterend', courseDetails);
  } else {
    courseGrid.insertAdjacentElement('afterend', courseDetails);
  }
};

const collapseCourseDetails = () => {
  activeCourseKey = null;
  courseButtons.forEach((button) => {
    button.classList.remove('is-active');
    button.setAttribute('aria-pressed', 'false');
  });
  courseDetails.classList.add('is-collapsed');
};

const openCourseDetails = (courseKey) => {
  activeCourseKey = courseKey;
  courseButtons.forEach((button) => {
    const isActive = button.dataset.course === courseKey;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  renderCourseDetails(courseKey);
  placeCourseDetails(courseKey);
  courseDetails.classList.remove('is-collapsed');
};

const toggleCourse = (courseKey) => {
  if (activeCourseKey === courseKey) {
    collapseCourseDetails();
    return;
  }

  openCourseDetails(courseKey);
};

courseButtons.forEach((button) => {
  button.addEventListener('click', () => toggleCourse(button.dataset.course));
});

const syncCourseDetailsPlacement = () => {
  if (activeCourseKey) {
    placeCourseDetails(activeCourseKey);
  }
};

if (mobileCourseLayout.addEventListener) {
  mobileCourseLayout.addEventListener('change', syncCourseDetailsPlacement);
} else if (mobileCourseLayout.addListener) {
  mobileCourseLayout.addListener(syncCourseDetailsPlacement);
}

window.addEventListener('resize', syncCourseDetailsPlacement);

collapseCourseDetails();
