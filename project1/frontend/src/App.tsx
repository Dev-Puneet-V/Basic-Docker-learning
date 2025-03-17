import { useState, useEffect } from "react";
import "./App.css";

interface Todo {
  _id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3001");

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "newTodo":
          setTodos((prev) => [data.todo, ...prev]);
          break;
        case "todoUpdated":
          setTodos((prev) =>
            prev.map((todo) => (todo._id === data.todo._id ? data.todo : todo))
          );
          break;
        case "todoDeleted":
          setTodos((prev) => prev.filter((todo) => todo._id !== data.id));
          break;
      }
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, []);

  // Fetch initial todos
  useEffect(() => {
    fetch("http://localhost:3000/api/todos")
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // Add new todo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const res = await fetch("http://localhost:3000/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTodo }),
    });

    if (res.ok) {
      setNewTodo("");
    }
  };

  // Toggle todo completion
  const toggleTodo = (id: string) => {
    ws?.send(JSON.stringify({ type: "toggleTodo", id }));
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    const res = await fetch(`http://localhost:3000/api/todos/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Failed to delete todo");
    }
  };

  return (
    <div className="container">
      <h1>Real-time Todo List</h1>

      <form onSubmit={handleSubmit} className="add-todo-form">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo..."
          className="todo-input"
        />
        <button type="submit" className="add-button">
          Add
        </button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo._id}
            className={`todo-item ${todo.completed ? "completed" : ""}`}
          >
            <span onClick={() => toggleTodo(todo._id)}>{todo.text}</span>
            <button
              onClick={() => deleteTodo(todo._id)}
              className="delete-button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
