import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
      if (!res.ok) return rejectWithValue(data?.message);

      return data?.tasks;
    } catch (err) {
      return rejectWithValue(err?.message);
    }
  }
);

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

export const updateTask = createAsyncThunk(
  "task/updateTask",
  async ({ taskId, updates }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const params = new URLSearchParams();
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          params.append(key, updates[key]);
        }
      });

      const res = await fetch(`/api/task/${taskId}?${params.toString()}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);

      return data.task;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

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
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      });
  },
});

export default taskSlice.reducer;
