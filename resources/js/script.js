// SETTINGS PAGE

const DEFAULT_SETTINGS = {
  appearance: {
    darkMode: false,
    backgroundDataUrl: null
  },
  language: "English",
  academic: {
    letter: true,
    percent: true,
    gpa: true,
    score: false,
    scoreScale: {
      A: 93,
      "A-": 90,
      "B+": 87,
      B: 83,
      "B-": 80,
      "C+": 77,
      C: 73,
      "C-": 70
    },
    dropLowest: false,
    categoryWeights: false,
    feedbackForum: true,
    gradeCalculator: true
  },
  notifications: {
    summary: false,
    gradeUpdates: false,
    deadlines: true
  },
  privacy: {
    exportData: false
  }
};

function cloneDefaultSettings() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

// USER AUTHENTICATION HELPERS

function getUsers() {
  const raw = localStorage.getItem("users");
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) || {};

    Object.keys(parsed).forEach((email) => {
      if (!parsed[email].settings) {
        parsed[email].settings = cloneDefaultSettings();
      }
      if (!Array.isArray(parsed[email].courses)) {
        parsed[email].courses = [];
      }
    });

    return parsed;
  } catch {
    return {};
  }
}

function setUsers(usersObj) {
  localStorage.setItem("users", JSON.stringify(usersObj));
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCurrentUser(userObj) {
  localStorage.setItem("currentUser", JSON.stringify(userObj));
}

function clearCurrentUser() {
  localStorage.removeItem("currentUser");
}

// PATH HELPERS

function goToLogin() {
  const path = window.location.pathname;

  if (path.includes("/landing_pages/")) {
    window.location.href = "../log-in.html";
  } else {
    window.location.href = "log-in.html";
  }
}

function goToIndex() {
  const path = window.location.pathname;

  if (path.includes("/landing_pages/")) {
    window.location.href = "../index.html";
  } else {
    window.location.href = "index.html";
  }
}

// MAIN STARTUP CODE

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const isLoginPage = body.classList.contains("login-page");
  const isRegisterPage = body.classList.contains("register-page");

  // Login page
  if (isLoginPage) {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const errorEl = document.getElementById("login-error");

    if (form && emailInput && passwordInput) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        const users = getUsers();
        const user = users[email];

        if (!user || user.password !== password) {
          if (errorEl) {
            errorEl.textContent = "Invalid email or password.";
          }
          return;
        }

        setCurrentUser({
          email,
          displayName: user.displayName || email
        });

        goToIndex();
      });
    }
  }

  // Registration page
  if (isRegisterPage) {
    const form = document.getElementById("register-form");
    const nameInput = document.getElementById("register-name");
    const emailInput = document.getElementById("register-email");
    const passwordInput = document.getElementById("register-password");
    const confirmInput = document.getElementById("register-confirm");
    const errorEl = document.getElementById("register-error");
    const successEl = document.getElementById("register-success");

    if (form && nameInput && emailInput && passwordInput && confirmInput) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (errorEl) errorEl.textContent = "";
        if (successEl) successEl.textContent = "";

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirm = confirmInput.value.trim();

        if (!name || !email || !password || !confirm) {
          if (errorEl) errorEl.textContent = "Please fill in all fields.";
          return;
        }

        if (password !== confirm) {
          if (errorEl) errorEl.textContent = "Passwords do not match.";
          return;
        }

        if (password.length < 4) {
          if (errorEl) {
            errorEl.textContent = "Password should be at least 4 characters.";
          }
          return;
        }

        const users = getUsers();

        if (users[email]) {
          if (errorEl) {
            errorEl.textContent = "An account with this email already exists.";
          }
          return;
        }

        users[email] = {
          password,
          displayName: name,
          courses: [],
          settings: cloneDefaultSettings()
        };
        setUsers(users);

        if (successEl) {
          successEl.textContent = "Account created! Redirecting to log in...";
        }

        setTimeout(() => {
          goToLogin();
        }, 1000);
      });
    }
  }

  const currentUser = getCurrentUser();

  // Protect non-auth pages
  if (!isLoginPage && !isRegisterPage) {
    if (!currentUser) {
      goToLogin();
      return;
    }
  }

  // Apply appearance settings
  if (currentUser) {
    const users = getUsers();
    const userRecord = users[currentUser.email];

    if (userRecord && userRecord.settings) {
      if (userRecord.settings.appearance.darkMode) {
        document.body.classList.add("dark-mode");
      }
      if (userRecord.settings.appearance.backgroundDataUrl) {
        document.body.style.backgroundImage =
          `url(${userRecord.settings.appearance.backgroundDataUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";
      }
    }
  }

  // Header username + logout
  const headerUserEl = document.querySelector(".user-email");
  const logoutBtn = document.querySelector(".logout-btn");

  if (headerUserEl) {
    if (currentUser) {
      headerUserEl.textContent =
        currentUser.displayName || currentUser.email || "User";
    } else {
      headerUserEl.textContent = "Guest";
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearCurrentUser();
      goToLogin();
    });
  }

  // Page specific initializers
  initViewPostPage();
  initMyProfilePage();
  initSettingsPage();
});

// FEEDBACK FORUM

const FORUM_STORAGE_KEY = "forumPosts";

function seedForumPosts() {
  return {
    "1": {
      id: "1",
      title: "Forum #1 - Midterm Feedback",
      courseName: "Intro to ITWS",
      author: "Student A",
      date: "11/21/25",
      body: "I found the midterm fair, but I would appreciate more practice problems before the exam.",
      likes: 2,
      comments: [
        {
          author: "Teacher Example",
          text: "Thanks for the feedback! We can add a review session.",
          date: "11/22/25 10:19:15PM"
        }
      ]
    },

    "2": {
      id: "2",
      title: "Forum #2 - Homework Load",
      courseName: "Intro to ITWS",
      author: "Student B",
      date: "12/07/25",
      body: "Homework feels a bit heavy this week along with the labs. Is it possible to reduce one assignment?",
      likes: 1,
      comments: [
      ]
    },

    "3": {
      id: "3",
      title: "Forum #3 - Group Projects",
      courseName: "Clown Theory",
      author: "Student C",
      date: "12/07/25",
      body: "Is it possible for us to take an exam without someone dressed up as a clown in the corner staring at us? It gives me anxiety.",
      likes: 0,
      comments: [
      ]
    },

    "4": {
      id: "4",
      title: "Forum #4 - Lab Instructions",
      courseName: "The Sociology of Zombies",
      author: "Student D",
      date: "12/07/25",
      body: "Sometimes the lab instructions are confusing. Maybe add more step-by-step details.",
      likes: 8,
      comments: []
    },

    "5": {
      id: "5",
      title: "Forum #5 - Exam Format",
      courseName: "Clown Theory",
      author: "Student E",
      date: "12/07/25",
      body: "You go a little too fast and get a little too excited when we talk about IT; it'd be easier to understand if you slowed down.",
      likes: 0,
      comments: []
    }
  };
}


function getForumPosts() {
  const raw = localStorage.getItem(FORUM_STORAGE_KEY);
  if (!raw) {
    const seed = seedForumPosts();
    localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) || {};
  } catch {
    const seed = seedForumPosts();
    localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function setForumPosts(posts) {
  localStorage.setItem(FORUM_STORAGE_KEY, JSON.stringify(posts));
}

function initViewPostPage() {
  if (!document.body.classList.contains("view-post-page")) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "1";

  const posts = getForumPosts();
  const post = posts[id];

  if (!post) {
    const titleEl = document.getElementById("post-title");
    if (titleEl) titleEl.textContent = "Post not found";
    return;
  }

  const currentUser = getCurrentUser();

  const titleEl = document.getElementById("post-title");
  const courseEl = document.getElementById("post-course");
  const authorEl = document.getElementById("post-author");
  const dateEl = document.getElementById("post-date");
  const bodyEl = document.getElementById("post-body");
  const likeCountEl = document.getElementById("like-count");
  const likeButton = document.getElementById("like-button");
  const commentsListEl = document.getElementById("comments-list");
  const commentForm = document.getElementById("comment-form");
  const commentText = document.getElementById("comment-text");
  const commentError = document.getElementById("comment-error");

  if (titleEl) titleEl.textContent = post.title;
  if (courseEl) courseEl.textContent = post.courseName;
  if (authorEl) authorEl.textContent = post.author;
  if (dateEl) dateEl.textContent = post.date;
  if (bodyEl) bodyEl.textContent = post.body;
  if (likeCountEl) likeCountEl.textContent = String(post.likes);

  function renderComments() {
    if (!commentsListEl) return;
    commentsListEl.innerHTML = "";

    if (!post.comments || post.comments.length === 0) {
      const p = document.createElement("p");
      p.textContent = "No comments yet. Be the first to comment.";
      commentsListEl.appendChild(p);
      return;
    }

    post.comments.forEach((cmt) => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "0.5rem";

      const who = document.createElement("strong");
      who.textContent = `${cmt.author}: `;

      const textSpan = document.createElement("span");
      textSpan.textContent = cmt.text;

      const meta = document.createElement("div");
      meta.style.fontSize = "0.75rem";
      meta.style.color = "#777";
      meta.textContent = cmt.date;

      wrapper.appendChild(who);
      wrapper.appendChild(textSpan);
      wrapper.appendChild(meta);

      commentsListEl.appendChild(wrapper);
    });
  }

  renderComments();

  if (likeButton && likeCountEl) {
    likeButton.addEventListener("click", () => {
      post.likes = (post.likes || 0) + 1;
      likeCountEl.textContent = String(post.likes);
      posts[id] = post;
      setForumPosts(posts);
    });
  }

  if (commentForm && commentText) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (commentError) commentError.textContent = "";

      const text = commentText.value.trim();
      if (!text) {
        if (commentError) {
          commentError.textContent = "Comment cannot be empty.";
        }
        return;
      }

      const authorName =
        (currentUser && (currentUser.displayName || currentUser.email)) ||
        "Anonymous";

      const now = new Date();
      const timestamp =
        now.toLocaleDateString() + " " + now.toLocaleTimeString();

      const newComment = {
        author: authorName,
        text,
        date: timestamp
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      posts[id] = post;
      setForumPosts(posts);

      commentText.value = "";
      renderComments();
    });
  }
}

// MY PROFILE PAGE

function initMyProfilePage() {
  if (!document.body.classList.contains("my-profile-page")) {
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getUsers();
  const userRecord =
    users[currentUser.email] || {
      password: "",
      displayName: currentUser.displayName || "",
      courses: [],
      settings: cloneDefaultSettings()
    };

  if (!Array.isArray(userRecord.courses)) {
    userRecord.courses = [];
  }

  const nameInput = document.getElementById("profile-name");
  const emailInput = document.getElementById("profile-email");
  const passwordInput = document.getElementById("profile-password");
  const saveBtn = document.getElementById("profile-save-btn");
  const saveMsg = document.getElementById("profile-save-message");
  const courseList = document.getElementById("profile-course-list");
  const newCourseInput = document.getElementById("new-course-input");
  const addCourseBtn = document.getElementById("add-course-btn");

  if (nameInput) nameInput.value = userRecord.displayName || "";
  if (emailInput) emailInput.value = currentUser.email || "";
  if (passwordInput) passwordInput.value = userRecord.password || "";

  const editButtons = document.querySelectorAll(".profile-row .edit-btn");
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = btn.closest(".profile-row");
      if (!row) return;
      const input = row.querySelector("input");
      if (!input) return;

      const isDisabled = input.disabled;
      input.disabled = !isDisabled;
      if (!input.disabled) {
        input.focus();
      }
    });
  });

  function renderCourses() {
    if (!courseList) return;
    courseList.innerHTML = "";

    if (!userRecord.courses || userRecord.courses.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No courses added yet.";
      empty.classList.add("course-empty");
      courseList.appendChild(empty);
      return;
    }

    userRecord.courses.forEach((course) => {
      const badge = document.createElement("div");
      badge.classList.add("course-badge");
      badge.textContent = course;
      courseList.appendChild(badge);
    });
  }

  renderCourses();

  if (addCourseBtn && newCourseInput) {
    addCourseBtn.addEventListener("click", () => {
      const name = newCourseInput.value.trim();
      if (!name) return;

      userRecord.courses.push(name);
      newCourseInput.value = "";
      renderCourses();

      users[currentUser.email] = userRecord;
      setUsers(users);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (saveMsg) saveMsg.textContent = "";

      const newName = nameInput ? nameInput.value.trim() : "";
      const newEmail = emailInput ? emailInput.value.trim() : "";
      const newPassword = passwordInput ? passwordInput.value.trim() : "";

      if (!newEmail) {
        if (saveMsg) {
          saveMsg.textContent = "Email cannot be empty.";
        }
        return;
      }

      const usersAll = getUsers();
      const oldEmail = currentUser.email;

      if (newEmail !== oldEmail && usersAll[newEmail]) {
        if (saveMsg) {
          saveMsg.textContent = "Another account already uses that email.";
        }
        return;
      }

      userRecord.displayName = newName || userRecord.displayName;
      userRecord.password = newPassword || userRecord.password;

      if (newEmail !== oldEmail) {
        usersAll[newEmail] = userRecord;
        delete usersAll[oldEmail];
        currentUser.email = newEmail;
      } else {
        usersAll[oldEmail] = userRecord;
      }

      currentUser.displayName = userRecord.displayName;
      setCurrentUser(currentUser);
      setUsers(usersAll);

      if (saveMsg) {
        saveMsg.textContent = "Profile saved.";
      }
    });
  }
}

// SETTINGS PAGE

function initSettingsPage() {
  if (!document.body.classList.contains("settings-page")) {
    return;
  }

  // Read ?student=... from the URL

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const users = getUsers();
  const userRecord = users[currentUser.email];
  if (!userRecord) return;

  if (!userRecord.settings) {
    userRecord.settings = cloneDefaultSettings();
  }

  const settings = userRecord.settings;

  const darkToggle = document.getElementById("settings-dark-mode-toggle");
  const bgUpload = document.getElementById("settings-bg-upload");
  const bgClearBtn = document.getElementById("settings-bg-clear");
  const langSelect = document.getElementById("settings-language");

  const prefLetter = document.getElementById("settings-pref-letter");
  const prefPercent = document.getElementById("settings-pref-percent");
  const prefGpa = document.getElementById("settings-pref-gpa");
  const prefScore = document.getElementById("settings-pref-score");
  const scoreScaleContainer = document.getElementById("settings-score-scale");

  function idForLetter(letter) {
    return "settings-score-" + letter.replace("+", "plus").replace("-", "minus");
  }

  const prefDrop = document.getElementById("settings-pref-drop-lowest");
  const prefCatWeights = document.getElementById(
    "settings-pref-category-weights"
  );
  const prefForum = document.getElementById("settings-pref-feedback-forum");
  const prefCalc = document.getElementById("settings-pref-grade-calculator");

  const notifSummary = document.getElementById("settings-notif-summary");
  const notifGrades = document.getElementById("settings-notif-grades");
  const notifDeadlines = document.getElementById("settings-notif-deadlines");

  const privExport = document.getElementById("settings-privacy-export");

  const saveBtn = document.getElementById("settings-save-btn");
  const saveMsg = document.getElementById("settings-save-message");
  const deleteBtn = document.getElementById("settings-delete-btn");

  if (darkToggle) {
    darkToggle.textContent = settings.appearance.darkMode ? "on" : "off";
  }

  if (langSelect) {
    langSelect.value = settings.language || "English";
  }

  if (prefLetter) prefLetter.checked = !!settings.academic.letter;
  if (prefPercent) prefPercent.checked = !!settings.academic.percent;
  if (prefGpa) prefGpa.checked = !!settings.academic.gpa;
  if (prefScore) prefScore.checked = !!settings.academic.score;

  if (prefScore) {
    prefScore.addEventListener("change", () => {
      settings.academic.score = prefScore.checked;
      if (scoreScaleContainer) {
        scoreScaleContainer.style.display = prefScore.checked
          ? "block"
          : "none";
      }
      userRecord.settings = settings;
      users[currentUser.email] = userRecord;
      setUsers(users);
    });
  }

  if (!settings.academic.scoreScale) {
    settings.academic.scoreScale = {
      A: 93,
      "A-": 90,
      "B+": 87,
      B: 83,
      "B-": 80,
      "C+": 77,
      C: 73,
      "C-": 70
    };
  }

  const letters = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-"];
  letters.forEach((letter) => {
    const inputId = idForLetter(letter);
    const inputEl = document.getElementById(inputId);
    if (!inputEl) return;

    const val = settings.academic.scoreScale[letter];
    if (typeof val === "number") {
      inputEl.value = String(val);
    } else {
      const defaults = DEFAULT_SETTINGS.academic.scoreScale;
      if (defaults && typeof defaults[letter] === "number") {
        inputEl.value = String(defaults[letter]);
      }
    }
  });

  if (scoreScaleContainer) {
    scoreScaleContainer.style.display =
      prefScore && prefScore.checked ? "block" : "none";
  }

  if (prefDrop) prefDrop.checked = !!settings.academic.dropLowest;
  if (prefCatWeights) {
    prefCatWeights.checked = !!settings.academic.categoryWeights;
  }
  if (prefForum) prefForum.checked = !!settings.academic.feedbackForum;
  if (prefCalc) prefCalc.checked = !!settings.academic.gradeCalculator;

  if (notifSummary) notifSummary.checked = !!settings.notifications.summary;
  if (notifGrades) {
    notifGrades.checked = !!settings.notifications.gradeUpdates;
  }
  if (notifDeadlines) {
    notifDeadlines.checked = !!settings.notifications.deadlines;
  }

  if (privExport) privExport.checked = !!settings.privacy.exportData;

  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      settings.appearance.darkMode = !settings.appearance.darkMode;
      darkToggle.textContent = settings.appearance.darkMode ? "on" : "off";

      if (settings.appearance.darkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }

      userRecord.settings = settings;
      users[currentUser.email] = userRecord;
      setUsers(users);
    });
  }

  if (bgUpload) {
    bgUpload.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (evt) {
        const dataUrl = evt.target.result;
        settings.appearance.backgroundDataUrl = dataUrl;
        document.body.style.backgroundImage = `url(${dataUrl})`;
        document.body.style.backgroundSize = "cover";
        document.body.style.backgroundRepeat = "no-repeat";

        userRecord.settings = settings;
        users[currentUser.email] = userRecord;
        setUsers(users);
      };
      reader.readAsDataURL(file);
    });
  }

  if (bgClearBtn) {
    bgClearBtn.addEventListener("click", () => {
      settings.appearance.backgroundDataUrl = null;
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundRepeat = "";
      if (bgUpload) {
        bgUpload.value = "";
      }

      userRecord.settings = settings;
      users[currentUser.email] = userRecord;
      setUsers(users);
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (saveMsg) saveMsg.textContent = "";

      if (prefLetter) settings.academic.letter = prefLetter.checked;
      if (prefPercent) settings.academic.percent = prefPercent.checked;
      if (prefGpa) settings.academic.gpa = prefGpa.checked;
      if (prefScore) settings.academic.score = prefScore.checked;

      const gradeLetters = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-"];
      const newScale = {};

      gradeLetters.forEach((letter) => {
        const inputId = idForLetter(letter);
        const inputEl = document.getElementById(inputId);
        if (!inputEl) return;
        const val = parseFloat(inputEl.value);
        if (!Number.isNaN(val)) {
          newScale[letter] = val;
        }
      });

      if (Object.keys(newScale).length > 0) {
        settings.academic.scoreScale = newScale;
      }

      if (prefDrop) settings.academic.dropLowest = prefDrop.checked;
      if (prefCatWeights) {
        settings.academic.categoryWeights = prefCatWeights.checked;
      }
      if (prefForum) settings.academic.feedbackForum = prefForum.checked;
      if (prefCalc) settings.academic.gradeCalculator = prefCalc.checked;

      if (notifSummary) {
        settings.notifications.summary = notifSummary.checked;
      }
      if (notifGrades) {
        settings.notifications.gradeUpdates = notifGrades.checked;
      }
      if (notifDeadlines) {
        settings.notifications.deadlines = notifDeadlines.checked;
      }

      if (privExport) {
        settings.privacy.exportData = privExport.checked;
      }

      userRecord.settings = settings;
      users[currentUser.email] = userRecord;
      setUsers(users);

      if (saveMsg) {
        saveMsg.textContent = "Settings saved.";
      }
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const sure = window.confirm(
        "Are you sure you want to delete your account? This cannot be undone."
      );
      if (!sure) return;

      const usersAll = getUsers();
      delete usersAll[currentUser.email];
      setUsers(usersAll);
      clearCurrentUser();
      goToLogin();
    });
  }
}

// EXTRA UI HELPERS FROM CLEANED VERSION

document.addEventListener("DOMContentLoaded", () => {
  // Feedback Forum Search
  const searchInput = document.querySelector(".forum-search-input");
  const forumRows = document.querySelectorAll(".forum-table-row");

  if (searchInput && forumRows.length > 0) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase();
      forumRows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(q) ? "grid" : "none";
      });
    });
  }

  // Class Overview: set course title from ?class=
  if (document.body.classList.contains("class-overview-page")) {
    const titleEl = document.getElementById("course-name");
    if (titleEl) {
      const params = new URLSearchParams(window.location.search);
      const classKey = params.get("class");

      const classNames = {
        class1: "Intro to ITWS",
        class2: "The Sociology of Zombies",
        class3: "Clown Theory"
      };

      if (classKey && classNames[classKey]) {
        titleEl.textContent = classNames[classKey];
      }
    }
  }
});
