
// ==========================================
// FOCUSFLOW - SINGLE PAGE APPLICATION
// ==========================================

// 1. Application state
const appState = {
    tasks: JSON.parse(localStorage.getItem("spaTasks") || "[]"),
    goals: JSON.parse(localStorage.getItem("spaGoals") || "[]"),
    userName: localStorage.getItem("spaUserName") || "Bhoomika"
};

const appContent = document.getElementById("appContent");
const pageTitle = document.getElementById("pageTitle");
const currentPage = document.getElementById("currentPage");

// 2. Save application data
function saveData() {
    localStorage.setItem("spaTasks", JSON.stringify(appState.tasks));
    localStorage.setItem("spaGoals", JSON.stringify(appState.goals));
    localStorage.setItem("spaUserName", appState.userName);
}

// 3. Update profile information
function updateProfile() {
    const firstLetter = appState.userName.charAt(0).toUpperCase();

    document.getElementById("userAvatar").textContent = firstLetter;
    document.getElementById("topAvatar").textContent = firstLetter;
    document.getElementById("sidebarUserName").textContent =
        "Welcome, " + appState.userName;
}

// 4. Update date
document.getElementById("currentDate").textContent =
    new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });

// 5. HTML escaping for user-entered text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// 6. Navigation links
document.querySelectorAll("[data-route]").forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        const route = this.dataset.route;

        if (route === getCurrentRoute()) {
            renderPage(route);
            return;
        }

        navigateTo(route);
    });
});

// 7. Get current route
function getCurrentRoute() {
    const route = window.location.hash.replace("#", "");
    const validRoutes = ["dashboard", "tasks", "calendar", "goals", "settings"];

    return validRoutes.includes(route) ? route : "dashboard";
}

// 8. Navigate without reloading
function navigateTo(route) {
    const validRoutes = ["dashboard", "tasks", "calendar", "goals", "settings"];

    if (!validRoutes.includes(route)) {
        route = "dashboard";
    }

    if (window.location.hash !== "#" + route) {
        history.pushState({ page: route }, "", "#" + route);
    }

    renderPage(route);
}

// 9. Browser Back and Forward support
window.addEventListener("popstate", () => {
    renderPage(getCurrentRoute());
});

window.addEventListener("hashchange", () => {
    renderPage(getCurrentRoute());
});

// 10. Dynamic page renderer
function renderPage(route) {
    const pages = {
        dashboard: renderDashboard,
        tasks: renderTasks,
        calendar: renderCalendar,
        goals: renderGoals,
        settings: renderSettings
    };

    const pageNames = {
        dashboard: "Dashboard",
        tasks: "My Tasks",
        calendar: "Calendar",
        goals: "My Goals",
        settings: "Settings"
    };

    if (!pages[route]) {
        route = "dashboard";
    }

    pageTitle.textContent = "My " + pageNames[route];
    currentPage.textContent = pageNames[route];

    document.querySelectorAll("[data-route]").forEach(link => {
        const active = link.dataset.route === route;

        link.classList.toggle("active", active);

        if (active) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    appContent.innerHTML = pages[route]();

    updateProfile();
    updateDashboardStats();

    appContent.focus({ preventScroll: true });
}

// 11. Dashboard page

function renderDashboard() {
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(task => task.completed).length;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    const now = new Date();

    const currentDate = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" :
                     hour < 17 ? "Good afternoon" : "Good evening";

    return `
        <div class="page-content">

            <section class="welcome-section">
                <div>
                    <p class="welcome-label">YOUR PRODUCTIVITY SPACE</p>
                    <h1>${greeting}, ${escapeHTML(appState.userName)}! ☀</h1>
                    <p class="welcome-text">
                        Every small step brings you closer to your goals.
                        Let's make today count!
                    </p>
                </div>

                <div class="date-card">
                    <span aria-hidden="true">📅</span>
                    <div>
                        <strong>${currentDate}</strong>
                        <p>Your day, your progress</p>
                    </div>
                </div>
            </section>

            <div class="stats-grid">
                <div class="stat-card">
                    <p>Total Tasks</p>
                    <h2 id="statTotal">${total}</h2>
                    <span class="stat-label">All your tasks</span>
                </div>

                <div class="stat-card">
                    <p>Completed</p>
                    <h2 id="statCompleted">${completed}</h2>
                    <span class="stat-label">Successfully finished</span>
                </div>

                <div class="stat-card">
                    <p>In Progress</p>
                    <h2 id="statProgress">${total - completed}</h2>
                    <span class="stat-label">Keep going!</span>
                </div>

                <div class="stat-card">
                    <p>My Goals</p>
                    <h2>${appState.goals.length}</h2>
                    <span class="stat-label">Personal goals</span>
                </div>
            </div>

            <div class="content-grid">
                <section class="panel">
                    <h2>Daily Progress</h2>
                    <p class="panel-subtitle">Your task completion today</p>

                    <div class="progress-track">
                        <div class="progress-fill" style="width:${progress}%"></div>
                    </div>

                    <p class="progress-text">
                        ${progress}% completed · ${completed} of ${total} tasks
                    </p>
                </section>

                <section class="panel">
                    <h2>Quick Actions</h2>
                    <p class="panel-subtitle">Continue working on your goals</p>

                    <button class="primary-btn" data-go="tasks">Manage Tasks</button>
                    <button class="primary-btn" data-go="goals">View Goals</button>
                </section>
            </div>

            <section class="panel weekly-panel">
                <h2>Weekly Overview</h2>
                <p class="panel-subtitle">
                    Stay consistent and make progress one day at a time.
                </p>
                <p class="weekly-message">
                    Every productive day is a step towards your goals. Keep going!
                </p>
            </section>

        </div>
    `;
}


// 12. Update dashboard statistics
function updateDashboardStats() {
    const total = appState.tasks.length;
    const completed = appState.tasks.filter(task => task.completed).length;

    const totalElement = document.getElementById("statTotal");
    const completedElement = document.getElementById("statCompleted");
    const progressElement = document.getElementById("statProgress");

    if (totalElement) totalElement.textContent = total;
    if (completedElement) completedElement.textContent = completed;
    if (progressElement) progressElement.textContent = total - completed;
}

// 13. Tasks page
function renderTasks() {
    return `
        <div class="page-content">
            <div class="page-heading">
                <h2>My Tasks</h2>
                <p>Organize your day and keep track of your progress.</p>
            </div>

            <section class="panel">
                <h2>Task Manager</h2>
                <p class="panel-subtitle">Add, search, complete and delete your tasks.</p>

                <form class="task-form" id="taskForm">
                    <input id="taskInput" type="text" placeholder="Enter a new task..." maxlength="120" required aria-label="New task">
                    <button type="submit">Add Task</button>
                </form>

                <input id="searchInput" class="search-input" type="search" placeholder="Search tasks..." aria-label="Search tasks">

                <div id="taskList" class="task-list">
                    ${getTaskHTML()}
                </div>
            </section>
        </div>
    `;
}

// 14. Display tasks
function getTaskHTML(filter = "") {
    const filteredTasks = appState.tasks.filter(task =>
        task.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (!filteredTasks.length) {
        return `<p class="empty-state">No tasks found. Add a new task to get started!</p>`;
    }

    return filteredTasks.map(task => `
        <div class="task-item ${task.completed ? "completed" : ""}">
            <input
                type="checkbox"
                data-task-id="${task.id}"
                ${task.completed ? "checked" : ""}
                aria-label="Mark ${escapeHTML(task.name)} as completed"
            >
            <span>${escapeHTML(task.name)}</span>
            <button class="delete-btn" data-delete-id="${task.id}" aria-label="Delete ${escapeHTML(task.name)}">Delete</button>
        </div>
    `).join("");
}

// 15. Add, complete and delete tasks
appContent.addEventListener("submit", event => {
    if (event.target.id !== "taskForm") return;

    event.preventDefault();

    const input = document.getElementById("taskInput");
    const name = input.value.trim();

    if (!name) return;

    appState.tasks.push({
        id: Date.now(),
        name: name,
        completed: false
    });

    saveData();
    renderPage("tasks");
});

appContent.addEventListener("change", event => {
    if (event.target.matches("[data-task-id]")) {
        const task = appState.tasks.find(
            item => item.id === Number(event.target.dataset.taskId)
        );

        if (task) {
            task.completed = event.target.checked;
            saveData();
            renderPage("tasks");
        }
    }

    if (event.target.matches("[data-goal-id]")) {
        const goal = appState.goals.find(
            item => item.id === Number(event.target.dataset.goalId)
        );

        if (goal) {
            goal.completed = event.target.checked;
            saveData();
            renderPage("goals");
        }
    }
});

appContent.addEventListener("click", event => {
    const deleteButton = event.target.closest("[data-delete-id]");

    if (deleteButton) {
        const id = Number(deleteButton.dataset.deleteId);
        appState.tasks = appState.tasks.filter(task => task.id !== id);
        saveData();
        renderPage("tasks");
        return;
    }

    const goButton = event.target.closest("[data-go]");

    if (goButton) {
        navigateTo(goButton.dataset.go);
        return;
    }

    const deleteGoal = event.target.closest("[data-delete-goal]");

    if (deleteGoal) {
        const id = Number(deleteGoal.dataset.deleteGoal);
        appState.goals = appState.goals.filter(goal => goal.id !== id);
        saveData();
        renderPage("goals");
    }
});

appContent.addEventListener("input", event => {
    if (event.target.id === "searchInput") {
        document.getElementById("taskList").innerHTML =
            getTaskHTML(event.target.value);
    }
});

// 16. Calendar page
function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthName = now.toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    let calendarHTML = "";

    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
        calendarHTML += `<div class="calendar-label">${day}</div>`;
    });

    for (let i = 0; i < firstDay; i++) {
        calendarHTML += `<div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === now.getDate();

        calendarHTML += `
            <div class="calendar-day ${isToday ? "today" : ""}">
                ${day}
            </div>
        `;
    }

    return `
        <div class="page-content">
            <div class="page-heading">
                <h2>Calendar</h2>
                <p>View your month and stay organized.</p>
            </div>

            <section class="panel">
                <h2>${monthName}</h2>
                <p class="panel-subtitle">Today's date is ${now.getDate()}.</p>

                <div class="calendar-grid">
                    ${calendarHTML}
                </div>
            </section>
        </div>
    `;
}

// 17. Goals page
function renderGoals() {
    return `
        <div class="page-content">
            <div class="page-heading">
                <h2>My Goals</h2>
                <p>Set meaningful goals and celebrate your progress.</p>
            </div>

            <section class="panel">
                <h2>Goal Manager</h2>
                <p class="panel-subtitle">Create and track your personal goals.</p>

                <form class="goal-form task-form" id="goalForm">
                    <input id="goalInput" type="text" placeholder="Enter a new goal..." maxlength="120" required aria-label="New goal">
                    <button type="submit">Add Goal</button>
                </form>

                <div class="goal-list">
                    ${appState.goals.length ? appState.goals.map(goal => `
                        <div class="goal-item">
                            <input type="checkbox" data-goal-id="${goal.id}" ${goal.completed ? "checked" : ""} aria-label="Mark ${escapeHTML(goal.name)} as completed">
                            <span>${escapeHTML(goal.name)}</span>
                            <button class="delete-btn" data-delete-goal="${goal.id}">Delete</button>
                        </div>
                    `).join("") : `<p class="empty-state">No goals added yet. Start by adding your first goal!</p>`}
                </div>
            </section>
        </div>
    `;
}

// 18. Add new goals
appContent.addEventListener("submit", event => {
    if (event.target.id !== "goalForm") return;

    event.preventDefault();

    const input = document.getElementById("goalInput");
    const name = input.value.trim();

    if (!name) return;

    appState.goals.push({
        id: Date.now(),
        name: name,
        completed: false
    });

    saveData();
    renderPage("goals");
});

// 19. Settings page
function renderSettings() {
    return `
        <div class="page-content">
            <div class="page-heading">
                <h2>Settings</h2>
                <p>Personalize your FocusFlow experience.</p>
            </div>

            <section class="panel">
                <h2>Profile Settings</h2>
                <p class="panel-subtitle">Update the name displayed in your dashboard.</p>

                <form id="settingsForm" class="settings-form">
                    <label>
                        Your Name
                        <input id="nameInput" type="text" maxlength="40" value="${escapeHTML(appState.userName)}" required>
                    </label>

                    <button type="submit" class="primary-btn">Save Changes</button>
                    <p id="settingsMessage" class="progress-text" role="status"></p>
                </form>
            </section>
        </div>
    `;
}

// 20. Save profile settings
appContent.addEventListener("submit", event => {
    if (event.target.id !== "settingsForm") return;

    event.preventDefault();

    const name = document.getElementById("nameInput").value.trim();

    if (!name) return;

    appState.userName = name;
    saveData();
    updateProfile();

    document.getElementById("settingsMessage").textContent =
        "Your profile has been updated successfully!";
    
    document.querySelector(".page-heading h2").textContent =
        "My Settings";
});

// 21. Initialize application
updateProfile();

if (!window.location.hash) {
    history.replaceState({ page: "dashboard" }, "", "#dashboard");
}

renderPage(getCurrentRoute());
