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

// ✅ Update Team
export const updateTeam = createAsyncThunk(
  "team/updateTeam",
  async ({ teamId, name }, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/team", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId, name }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to update team");
      return data.team;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Delete Team
export const deleteTeam = createAsyncThunk(
  "team/deleteTeam",
  async (teamId, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/team", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || "Failed to delete team");
      return teamId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Add Member to Team
export const addTeamMember = createAsyncThunk(
  "team/addMember",
  async ({ teamId, memberEmail }, { rejectWithValue, getState }) => {
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
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);


// ✅ Delete Member from Team
export const deleteTeamMember = createAsyncThunk(
  "team/deleteMember",
  async ({ memberId, teamId }, { rejectWithValue, getState }) => {
    const { token } = getState().auth;
    try {
      const res = await fetch("/api/teamMember", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId, teamId }),
      });

      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message);
      return data; // contains message and updated team
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
      if (!res.ok) return rejectWithValue(data.message);
      return data.team;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Slice
const teamSlice = createSlice({
  name: "team",
  initialState: {
    teams: [],
    singleTeam: null,
    loading: false,
    error: null,
    success: null,
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

      // Update Team
      .addCase(updateTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.map((t) =>
          t._id === action.payload._id ? action.payload : t
        );
        if (state.singleTeam?._id === action.payload._id) {
          state.singleTeam = action.payload;
        }
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Team
      .addCase(deleteTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter((t) => t._id !== action.payload);
        if (state.singleTeam?._id === action.payload) {
          state.singleTeam = null;
        }
      })
      .addCase(deleteTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Member
      .addCase(addTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.singleTeam && action.payload.team) {
          state.singleTeam.members = action.payload.team.members;
        }
        state.success = action.payload.message;
      })
      .addCase(addTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Member
      .addCase(deleteTeamMember.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        if (state.singleTeam) {
          state.singleTeam.members = state.singleTeam.members.filter(
            (m) => m._id.toString() !== action.meta.arg.memberId.toString()
          );
        }
        state.success = action.payload.message;
      })
      .addCase(deleteTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single Team
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
