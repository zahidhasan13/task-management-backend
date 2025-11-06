// redux/slices/teamSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// ✅ Fetch Teams
export const fetchTeams = createAsyncThunk(
  "team/fetchTeams",
  async (_, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/team", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.teams;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Create Team
export const createTeam = createAsyncThunk(
  "team/createTeam",
  async ({ name }, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data.team;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Add Member to Team
export const addTeamMember = createAsyncThunk(
  "team/addMember",
  async ({ memberEmail, teamId }, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/teamMember", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberEmail, teamId }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data; // (No UI update needed here)
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Get Single Team
export const getSingleTeam = createAsyncThunk(
  "team/getSingleTeam",
  async (teamId, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch(`/api/team/${teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) return rejectWithValue(data.message);
      return data.team;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ FIX: Added singleTeam initial state
const teamSlice = createSlice({
  name: "team",
  initialState: {
    teams: [],
    singleTeam: null, // ✅ <-- FIXED
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // Fetch Teams
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Team
      .addCase(createTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeamMember.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ✅ Single Team
      .addCase(getSingleTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSingleTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.singleTeam = action.payload;
      })
      .addCase(getSingleTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default teamSlice.reducer;
