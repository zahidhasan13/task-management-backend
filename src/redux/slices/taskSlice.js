import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Fetch tasks by team
export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (teamId, { rejectWithValue, getState }) => {
    try {
      // ✅ Get token from Redux
      const token = getState().auth.token;

      if (!token) {
        return rejectWithValue("No authentication token found. Please log in.");
      }

      const res = await fetch(`/api/task?teamId=${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ MUST send header
        },
      });

      const data = await res.json();

      if (!res.ok) return rejectWithValue(data.message);

      return data.tasks;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);



// Create task
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

const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [],
    singleTask: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
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

      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.push(action.payload);
      });
  },
});

export default taskSlice.reducer;
