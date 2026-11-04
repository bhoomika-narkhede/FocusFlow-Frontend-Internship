
// Get HTML elements
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const taskMessage = document.getElementById("taskMessage");

// Load saved tasks or use default tasks
let tasks = JSON.parse(localStorage.getItem("focusflowTasks")) || [
    { id: 1, name: "Complete project documentation", completed: true },
    { id: 2, name: "Practice Python programming", completed: false },
    { id: 3, name: "Work on internship assignment", completed: false },
    { id: 4, name: "Read a new technical article", completed: false },
    { id: 5, name: "Plan tomorrow's activities", completed: false }
];

// Save tasks in Local Storage
function saveTasks() {
    localStorage.setItem("focusflowTasks", JSON.stringify(tasks));
}

// Display tasks on the dashboard
function displayTasks(searchText = "") {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(searchText.toLowerCase())
    );

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "<p>No tasks found.</p>";
    }

    filteredTasks.forEach(task => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";

        taskItem.innerHTML = `
            <div class="task-check ${task.completed ? "completed" : ""}"
                 data-action="toggle" data-id="${task.id}">
                ${task.completed ? "✓" : ""}
            </div>

            <div class="task-info">
                <h3 style="${task.completed ? "text-decoration: line-through;" : ""}">
                    ${escapeHTML(task.name)}
                </h3>
                <p>Personal Task</p>
            </div>

            <button class="delete-task" data-action="delete"
                    data-id="${task.id}" aria-label="Delete task">
                Delete
            </button>
        `;

        taskList.appendChild(taskItem);
    });

    updateProgress();
}

// Prevent HTML injection in task names
function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

// Add a new task
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskName = taskInput.value.trim();

    if (taskName === "") {
        taskMessage.textContent = "Please enter a task.";
        return;
    }

    tasks.push({
        id: Date.now(),
        name: taskName,
        completed: false
    });

    saveTasks();
    displayTasks(searchInput.value);

    taskInput.value = "";
    taskMessage.textContent = "Task added successfully!";
});

// Complete or delete a task
taskList.addEventListener("click", function(event) {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const taskId = Number(button.dataset.id);

    if (button.dataset.action === "toggle") {
        const task = tasks.find(task => task.id === taskId);
        if (task) task.completed = !task.completed;
    }

    if (button.dataset.action === "delete") {
        tasks = tasks.filter(task => task.id !== taskId);
    }

    saveTasks();
    displayTasks(searchInput.value);
    taskMessage.textContent = "Task list updated!";
});

// Search tasks
searchInput.addEventListener("input", function() {
    displayTasks(searchInput.value);
});

// Update progress information

function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const inProgress = total - completed;
    const overdue = 0;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    // Update top summary cards
    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("inProgressTasks").textContent = inProgress;
    document.getElementById("overdueTasks").textContent = overdue;

    // Update daily progress
    const progressHeading = document.querySelector(".progress-inner h2");
    const progressDetails = document.querySelector(".progress-details strong");
    const progressCircle = document.querySelector(".progress-circle");

    if (progressHeading) {
        progressHeading.textContent = percentage + "%";
    }

    if (progressDetails) {
        progressDetails.textContent = completed + " / " + total;
    }

    if (progressCircle) {
        progressCircle.style.background =
            `conic-gradient(#6c63ff ${percentage}%, #e8e8f0 ${percentage}%)`;
    }
}


// Initial display
displayTasks();

// Personalized Welcome and Current Date

function updateWelcome() {
    let savedName = localStorage.getItem("focusflowUserName");

    if (!savedName) {
        savedName = prompt("Welcome to FocusFlow! Please enter your name:");

        if (savedName && savedName.trim() !== "") {
            savedName = savedName.trim();
            localStorage.setItem("focusflowUserName", savedName);
        } else {
            savedName = "User";
        }
    }

    document.getElementById("userName").textContent = savedName;

    const now = new Date();

    const hour = now.getHours();
    let greeting = "Good morning";

    if (hour >= 12 && hour < 17) {
        greeting = "Good afternoon";
    } else if (hour >= 17) {
        greeting = "Good evening";
    }

    document.querySelector(".welcome-section h1").firstChild.textContent =
        greeting + ", ";

    const formattedDate = now.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    });

    document.getElementById("currentDate").textContent = formattedDate;
}

updateWelcome();

