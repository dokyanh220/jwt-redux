import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  id: null,
  name: '',
  email: '',
  accessToken: '',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { id, name, email, accessToken } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.accessToken = accessToken;
    },
    clearUser: (state) => {
      state.id = null;
      state.name = '';
      state.email = '';
      state.accessToken = '';
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;