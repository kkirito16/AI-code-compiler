import React, { useState } from 'react';

const TodoApp = () => {
    // 使用 useState 钩子来管理待办事项列表
    const [todos, setTodos] = useState([]);
    // 管理输入框中的新待办事项文本
    const [newTodo, setNewTodo] = useState('');

    // 处理新待办事项的添加
    const handleAddTodo = () => {
        if (newTodo.trim() !== '') {
            setTodos([...todos, { text: newTodo, completed: false }]);
            setNewTodo('');
        }
    };

    // 处理待办事项完成状态的切换
    const handleToggleComplete = (index) => {
        const newTodos = [...todos];
        newTodos[index].completed = !newTodos[index].completed;
        setTodos(newTodos);
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.1)'
        }}>
            <h1 style={{ color: "black" }}>待办事项列表</h1>
            <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="输入新的待办事项"
                style={{
                    padding: '8px',
                    marginRight: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '3px'
                }}
            />
            <button
                onClick={handleAddTodo}
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
            >
                添加
            </button>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {todos.map((todo, index) => (
                    <li
                        key={index}
                        style={{
                            margin: '10px 0',
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: todo.completed ? 'line-through' : 'none'
                        }}
                    >
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => handleToggleComplete(index)}
                            style={{ marginRight: '10px' }}
                        />
                        {todo.text}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TodoApp;