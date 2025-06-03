let tasks = [];

document.getElementById('add-task').addEventListener('click', function() {
    const taskInput = document.getElementById('new-task');
    if (taskInput.value.trim() !== '') {
        const task = {
            id: Date.now(),
            description: taskInput.value.trim(),
            status: 'TO-DO',
            archived: false
        };
        tasks.push(task);
        taskInput.value = '';
        renderTasks();
    }
});

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        if (!task.archived) {
            const taskItem = document.createElement('li');
            taskItem.className = 'flex justify-between items-center p-2 bg-gray-100 mb-2 rounded';
            taskItem.innerHTML = `
                <div class="flex items-center">
                    <span class="mr-2">${task.description}</span>
                    <select data-id="${task.id}" class="status bg-white border p-1 rounded">
                        <option value="TO-DO" ${task.status === 'TO-DO' ? 'selected' : ''}>TO-DO</option>
                        <option value="In-Progress" ${task.status === 'In-Progress' ? 'selected' : ''}>In-Progress</option>
                        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                </div>
                <button data-id="${task.id}" class="edit bg-yellow-500 text-white py-1 px-2 rounded">Edit</button>
                <button data-id="${task.id}" class="archive bg-red-500 text-white py-1 px-2 rounded">Archive</button>
            `;
            taskList.appendChild(taskItem);
        }
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const task = tasks.find(t => t.id === parseInt(id));
            const newDescription = prompt('Edit Task Description:', task.description);
            if (newDescription !== null && newDescription.trim() !== '') {
                task.description = newDescription.trim();
                renderTasks();
            }
        });
    });

    document.querySelectorAll('.archive').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const task = tasks.find(t => t.id === parseInt(id));
            task.archived = true;
            renderTasks();
        });
    });

    document.querySelectorAll('.status').forEach(select => {
        select.addEventListener('change', function() {
            const id = this.getAttribute('data-id');
            const task = tasks.find(t => t.id === parseInt(id));
            const newStatus = this.value;
            if ((newStatus === 'In-Progress' && task.status === 'Done') || 
                (newStatus === 'TO-DO' && (task.status === 'Done' || task.archived))) {
                alert('Invalid status change.');
                renderTasks();
            } else {
                task.status = newStatus;
            }
        });
    });
}