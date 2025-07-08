import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './dashboard.css';

function Dashboard({ onLogOut }) {
    const [lists, setLists] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedListId, setSelectedListId] = useState(null);
    const [isSmallScreen, setIsSmallScreen] = useState(false);

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
                <button className="AddTaskButton" >Add Task</button>
            </div>
            <div className="StatusContainers">
                <div className="statusColumn">
                    <h3>To Do</h3>
                    {tasks.filter(task => task.status === 'ToDo').map((task, idx) => (
                        <div className="taskCard" key={task.id ?? idx}>{task.name}</div>
                    ))}
                </div>
                <div className="statusColumn">
                    <h3>In Progress</h3>
                    {tasks.filter(task => task.status === 'In Progress').map((task, idx) => (
                        <div className="taskCard" key={task.id ?? idx}>{task.name}</div>
                    ))}
                </div>
                <div className="statusColumn">
                    <h3>Completed</h3>
                    {tasks.filter(task => task.status === 'Completed').map((task, idx) => (
                        <div className="taskCard" key={task.id ?? idx}>{task.name}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Dashboard;
