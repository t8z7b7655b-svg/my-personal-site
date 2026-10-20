// ========== 工具函数 ==========
function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function loadFromStorage(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function isUrgent(dateStr) {
    if (!dateStr) return false;
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = (target - today) / (1000 * 60 * 60 * 24);
    return diff <= 2 && diff >= 0;
}

// ========== 1. 学习计划（仅 plan.html 生效） ==========
const planInput = document.getElementById('planInput');
const planDeadline = document.getElementById('planDeadline');
const addPlanBtn = document.getElementById('addPlanBtn');
const planList = document.getElementById('planList');

if (planList) {
    let plans = loadFromStorage('studyPlans');
    let editingPlanIndex = -1;

    function renderPlans() {
        planList.innerHTML = '';
        plans.forEach((plan, index) => {
            const li = document.createElement('li');
            li.className = 'item';
            const urgentClass = isUrgent(plan.deadline) ? 'urgent' : '';
            const deadlineHtml = plan.deadline
                ? `<span class="deadline-tag ${urgentClass}">DDL: ${formatDate(plan.deadline)}</span>`
                : '';
            
            li.innerHTML = `
                <span class="item-text">${plan.text}</span>
                ${deadlineHtml}
                <button class="edit-btn" data-edit="${index}">编辑</button>
                <button class="delete-btn" data-delete="${index}">删除</button>
            `;
            planList.appendChild(li);
        });
    }

    function addOrUpdatePlan() {
        const text = planInput.value.trim();
        if (!text) return;
        const deadline = planDeadline.value;

        if (editingPlanIndex > -1) {
            plans[editingPlanIndex] = { text, deadline };
            editingPlanIndex = -1;
            addPlanBtn.textContent = '添加计划';
        } else {
            plans.unshift({ text, deadline, done: false });
        }

        saveToStorage('studyPlans', plans);
        renderPlans();
        planInput.value = '';
        planDeadline.value = '';
    }

    addPlanBtn.addEventListener('click', addOrUpdatePlan);

    planList.addEventListener('click', (e) => {
        const editIdx = e.target.dataset.edit;
        const delIdx = e.target.dataset.delete;

        if (editIdx !== undefined) {
            const plan = plans[editIdx];
            planInput.value = plan.text;
            planDeadline.value = plan.deadline || '';
            editingPlanIndex = Number(editIdx);
            addPlanBtn.textContent = '保存修改';
            planInput.focus();
        }

        if (delIdx !== undefined) {
            plans.splice(delIdx, 1);
            saveToStorage('studyPlans', plans);
            renderPlans();
        }
    });

    renderPlans();
}

// ========== 2. 待办清单（仅 todo.html 生效） ==========
const todoInput = document.getElementById('todoInput');
const todoDeadline = document.getElementById('todoDeadline');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

if (todoList) {
    let todos = loadFromStorage('todos');

    function renderTodos() {
        todoList.innerHTML = '';
        todos.forEach((todo, index) => {
            const li = document.createElement('li');
            li.className = `item ${todo.done ? 'done' : ''}`;
            const urgentClass = isUrgent(todo.deadline) ? 'urgent' : '';
            const deadlineHtml = todo.deadline
                ? `<span class="deadline-tag ${urgentClass}">DDL: ${formatDate(todo.deadline)}</span>`
                : '';

            li.innerHTML = `
                <input type="checkbox" ${todo.done ? 'checked' : ''} data-check="${index}">
                <span class="item-text">${todo.text}</span>
                ${deadlineHtml}
                <button class="delete-btn" data-delete="${index}">删除</button>
            `;
            todoList.appendChild(li);
        });
    }

    function addTodo() {
        const text = todoInput.value.trim();
        if (!text) return;
        todos.unshift({
            text,
            deadline: todoDeadline.value,
            done: false
        });
        saveToStorage('todos', todos);
        renderTodos();
        todoInput.value = '';
        todoDeadline.value = '';
    }

    addTodoBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') addTodo();
    });

    todoList.addEventListener('click', e => {
        const checkIdx = e.target.dataset.check;
        const delIdx = e.target.dataset.delete;

        if (checkIdx !== undefined) {
            todos[checkIdx].done = e.target.checked;
            saveToStorage('todos', todos);
            renderTodos();
        }

        if (delIdx !== undefined) {
            todos.splice(delIdx, 1);
            saveToStorage('todos', todos);
            renderTodos();
        }
    });

    renderTodos();
}

// ========== 3. 学习日志（仅 log.html 生效） ==========
const logInput = document.getElementById('logInput');
const addLogBtn = document.getElementById('addLogBtn');
const logHistory = document.getElementById('logHistory');
const todayDateEl = document.getElementById('todayDate');

if (logHistory) {
    let logs = loadFromStorage('studyLogs');

    function getTodayStr() {
        return new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    function renderLogs() {
        logHistory.innerHTML = '';
        logs.forEach(log => {
            const div = document.createElement('div');
            div.className = 'log-item';
            div.innerHTML = `
                <div class="log-date">${log.date}</div>
                <div class="log-content">${log.content.replace(/\n/g, '<br>')}</div>
            `;
            logHistory.appendChild(div);
        });
    }

    function saveLog() {
        const content = logInput.value.trim();
        if (!content) return;
        const today = getTodayStr();
        const existIndex = logs.findIndex(log => log.date === today);

        if (existIndex > -1) {
            logs[existIndex].content = content;
        } else {
            logs.unshift({ date: today, content });
        }

        saveToStorage('studyLogs', logs);
        renderLogs();
    }

    addLogBtn.addEventListener('click', saveLog);

    // 页面初始化
    const today = getTodayStr();
    todayDateEl.textContent = `📆 今日：${today}`;
    renderLogs();

    // 回填今日日志
    const todayLog = logs.find(log => log.date === today);
    if (todayLog) logInput.value = todayLog.content;
}
