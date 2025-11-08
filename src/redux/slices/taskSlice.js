import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* ============================
   FETCH TASKS (GET /api/task)
===============================*/
export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (teamId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No authentication token found.");

      const res = await fetch(`/api/task?teamId=${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);

      return data.tasks;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ============================
   CREATE TASK (POST /api/task)
===============================*/
export const createTask = createAsyncThunk(
  "task/createTask",
  async (taskData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;

      const res = await fetch(`/api/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);

      return data.task;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ==========================================
   UPDATE TASK STATUS (PATCH /api/task/:id)
=============================================*/
export const updateTask = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, updates }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;

      // Build URL with search parameters
      const params = new URLSearchParams();
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          params.append(key, updates[key]);
        }
      });

      console.log('Updating task:', taskId, 'with params:', params.toString());

      const res = await fetch(`/api/task/${taskId}?${params.toString()}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Remove Content-Type since we're using URL params, not JSON body
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);

      return data.task;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ==========================================
   DELETE TASK (DELETE /api/task/:id)
=============================================*/
export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (taskId, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;

      const res = await fetch(`/api/task/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);

      return taskId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/* ============================
        SLICE
===============================*/
const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })

      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      })

      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      });
  },
});

export default taskSlice.reducer;
