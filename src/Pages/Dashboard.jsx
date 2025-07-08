import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogOut, isUserLoggedIn }) {
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newListName, setNewListName] = useState('');
    const navigate = useNavigate();

    const [selectedTask, setSelectedTask] = useState(null);

    useEffect(() => {
        if (!isUserLoggedIn) {
            navigate('/login');
        }
    }, [isUserLoggedIn, navigate]);
    useEffect(() => {
        const fetchLists = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://Dev4Side.bsite.net/lists', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLists(response.data);
                if (response.data.length > 0) {
                    const smallestId = Math.min(...response.data.map(list => list.listId));
                    setSelectedListId(smallestId);
                }
            } catch (error) {
                console.error('Error fetching lists:', error);
            }
        };
        fetchLists();
    }, []);

    useEffect(() => {
        if (!selectedListId) {
            setTasks([]);
            return;
        }

        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`https://Dev4Side.bsite.net/tasks/${selectedListId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        fetchTasks();
    }, [selectedListId]);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSmallScreen(window.innerWidth < 1000);
        };

        window.addEventListener('resize', checkScreenSize);
        checkScreenSize();

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', taskId.toString());
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData('text/plain');
        const task = tasks.find(t => t.taskId === parseInt(taskId));
        if (!task) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://Dev4Side.bsite.net/tasks/${taskId}`, {
                ...task,
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            setTasks(prev =>
                prev.map(task => task.taskId === parseInt(taskId) ? { ...task, status: newStatus } : task)
            );
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const handleAddTask = async () => {
        if (!newTaskName || !newDueDate || !selectedListId) {
            alert('Please fill out all fields');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(`https://Dev4Side.bsite.net/tasks`, {
                name: newTaskName,
                description: newDescription,
                dueDate: newDueDate,
                listId: selectedListId,
                status: 'ToDo'
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const response = await axios.get(`https://Dev4Side.bsite.net/tasks/${selectedListId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);

            setNewTaskName('');
            setNewDueDate('');
            setNewDescription('');
            setIsAddTaskOpen(false);
        } catch (error) {
            console.error('Error adding new task:', error);
        }
    };

    const handleAddList = async () => {
        if (!newListName) {
            alert('Please enter a list name');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`https://Dev4Side.bsite.net/lists`, {
                name: newListName
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            const createdList = response.data;

            const listsResponse = await axios.get('https://Dev4Side.bsite.net/lists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists(listsResponse.data);

            setSelectedListId(createdList.listId);
            setNewListName('');
        } catch (error) {
            console.error('Error adding new list:', error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://Dev4Side.bsite.net/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTasks(prev => prev.filter(task => task.taskId !== taskId));
            setSelectedTask(null);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleUpdateTask = async () => {
        if (!selectedTask.name || !selectedTask.dueDate) {
            alert('Please fill out task name and due date');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`https://Dev4Side.bsite.net/tasks/${selectedTask.taskId}`, {
                ...selectedTask
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            // Refresh tasks after update
            const response = await axios.get(`https://Dev4Side.bsite.net/tasks/${selectedListId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
            alert('Task updated successfully!');
            setSelectedTask(null);
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    // NEW: Delete List handler
    const handleDeleteList = async () => {
        if (!selectedListId) {
            alert("No list selected to delete");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this list? This will delete all tasks in it.")) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`https://Dev4Side.bsite.net/lists/${selectedListId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update lists after deletion
            const listsResponse = await axios.get('https://Dev4Side.bsite.net/lists', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLists(listsResponse.data);

            // Reset selected list id to another list if any, else null
            if (listsResponse.data.length > 0) {
                setSelectedListId(listsResponse.data[0].listId);
            } else {
                setSelectedListId(null);
                setTasks([]);
            }
        } catch (error) {
            console.error('Error deleting list:', error);
        }
    };

    const statusMap = [
        { label: 'To Do', value: 'ToDo' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' }
    ];

    if (isSmallScreen) {
        return (
            <div className="warningMessage">
                <p> ⚠️ This is a desktop app. Please use a larger screen (≥ 1000px) ⚠️</p>
            </div>
        );
    }

    return (
        <div className='dashboardContainer'>
            <div className='left'>
                <div className="ListContainer">
                    {lists.map((list, idx) => (
                        <div
                            className={`listCard ${selectedListId === list.listId ? 'selected' : ''}`}
                            key={list.listId ?? idx}
                            onClick={() => setSelectedListId(list.listId)}
                        >
                            {list.name}
                        </div>
                    ))}
                </div>
                <button className="logoutButton" onClick={onLogOut}>Logout</button>
                <button className="AddTaskButton" onClick={() => setIsAddTaskOpen(true)}>Add Task</button>

                {/* Add Task Panel */}
                {isAddTaskOpen && (
                    <div className="addTaskPanel">
                        <button className="closeButton" onClick={() => setIsAddTaskOpen(false)}>X</button>
                        <h3>Add New Task</h3>

                        <div className="formGroup">
                            <label>Select List:</label>
                            <select
                                value={selectedListId}
                                onChange={(e) => setSelectedListId(parseInt(e.target.value))}
                                style={{
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '14px',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {lists.map(list => (
                                    <option key={list.listId} value={list.listId}>
                                        {list.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="formGroup">
                            <label>Task Name:</label>
                            <input
                                type="text"
                                placeholder="Enter task name"
                                value={newTaskName}
                                onChange={(e) => setNewTaskName(e.target.value)}
                            />
                        </div>

                        <div className="formGroup">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={newDueDate}
                                onChange={(e) => setNewDueDate(e.target.value)}
                            />
                        </div>

                        <div className="formGroup">
                            <label>Description:</label>
                            <textarea
                                rows="4"
                                placeholder="Enter description"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </div>

                        <button className="submitTaskButton" onClick={handleAddTask}>
                            Add Task
                        </button>

                        <hr />

                        <h3>Create New List</h3>
                        <div className="formGroup">
                            <label>List Name:</label>
                            <input
                                type="text"
                                placeholder="Enter list name"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                            />
                        </div>

                        <button className="submitListButton" onClick={handleAddList}>
                            Add List
                        </button>

                        {/* NEW: Delete List button */}
                        <button
                            className="submitListButton"
                            style={{ backgroundColor: '#dc3545', marginTop: '10px' }}
                            onClick={handleDeleteList}
                        >
                            Delete Selected List
                        </button>
                    </div>
                )}

                {/* Task Detail/Edit Panel */}
                {selectedTask && (
                    <div className="addTaskPanel">
                        <button className="closeButton" onClick={() => setSelectedTask(null)}>X</button>
                        <h3>Task Details</h3>

                        <div className="formGroup">
                            <label>Name:</label>
                            <input
                                type="text"
                                value={selectedTask.name}
                                onChange={(e) => setSelectedTask({ ...selectedTask, name: e.target.value })}
                            />
                        </div>

                        <div className="formGroup">
                            <label>Description:</label>
                            <textarea
                                rows="4"
                                value={selectedTask.description || ''}
                                onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                            />
                        </div>

                        <div className="formGroup">
                            <label>Due Date:</label>
                            <input
                                type="date"
                                value={selectedTask.dueDate ? selectedTask.dueDate.slice(0, 10) : ''}
                                onChange={(e) => setSelectedTask({ ...selectedTask, dueDate: e.target.value })}
                            />
                        </div>

                        <button
                            className="submitListButton"
                            style={{ backgroundColor: '#007bff', marginTop: '20px' }}
                            onClick={handleUpdateTask}
                        >
                            Update Task
                        </button>

                        <button
                            className="submitListButton"
                            style={{ backgroundColor: '#dc3545', marginTop: '10px' }}
                            onClick={() => handleDeleteTask(selectedTask.taskId)}
                        >
                            Delete Task
                        </button>
                    </div>
                )}
            </div>

            <div className="StatusContainers">
                {statusMap.map(({ label, value }) => (
                    <div
                        className="statusColumn"
                        key={value}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, value)}
                    >
                        <h3>{label}</h3>
                        {tasks
                            .filter(task => task.status === value)
                            .map((task, idx) => (
                                <div
                                    className="taskCard"
                                    key={task.taskId ?? idx}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task.taskId)}
                                    onClick={() => setSelectedTask(task)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {task.name}
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
