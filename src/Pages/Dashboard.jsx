import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';

function Dashboard({ onLogOut }) {
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('https://Dev4Side.bsite.net/lists', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLists(response.data);
                console.log(response.data);
                if (response.data.length > 0) {
                    const smallestId = Math.min(...response.data.map(list => list.listId));
                    setSelectedListId(smallestId);
                    console.log("smallest Listid ", smallestId);
                }
            } catch (error) {
                console.error('Error fetching lists:', error);
            }
        };
        fetchLists();
    }, []);

    useEffect(() => {
        if (!selectedListId) return;

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

    if (isSmallScreen) {
        return (
            <div className="warningMessage">
                <p>This is a desktop app. Please use a larger screen (≥ 1000px).</p>
            </div>
        );
    }

    const handleDragStart = (e, taskId) => {
        console.log('Dragging taskId:', taskId);
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

    const statusMap = [
        { label: 'To Do', value: 'ToDo' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' }
    ];

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
                {isAddTaskOpen && (
                    <div className="addTaskPanel">
                        <button className="closeButton" onClick={() => setIsAddTaskOpen(false)}>X</button>
                        <h3>Add New Task</h3>

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
                                >
                                    {task.name}
                                </div>
                            ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Dashboard;
