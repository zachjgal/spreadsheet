import { configureStore } from "@reduxjs/toolkit";
import { sheetState } from "./features/sheetState";
import { enableMapSet } from "immer";

enableMapSet();

export const store = configureStore({
  reducer: {
    data: sheetState.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
