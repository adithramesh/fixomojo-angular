import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Auth } from './auth.model';
import { AuthActions } from './auth.actions';

export const authsFeatureKey = 'auths';

export interface State extends EntityState<Auth> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Auth> = createEntityAdapter<Auth>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export const reducer = createReducer(
  initialState,
  on(AuthActions.addAuth,
    (state, action) => adapter.addOne(action.auth, state)
  ),
  on(AuthActions.upsertAuth,
    (state, action) => adapter.upsertOne(action.auth, state)
  ),
  on(AuthActions.addAuths,
    (state, action) => adapter.addMany(action.auths, state)
  ),
  on(AuthActions.upsertAuths,
    (state, action) => adapter.upsertMany(action.auths, state)
  ),
  on(AuthActions.updateAuth,
    (state, action) => adapter.updateOne(action.auth, state)
  ),
  on(AuthActions.updateAuths,
    (state, action) => adapter.updateMany(action.auths, state)
  ),
  on(AuthActions.deleteAuth,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(AuthActions.deleteAuths,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(AuthActions.loadAuths,
    (state, action) => adapter.setAll(action.auths, state)
  ),
  on(AuthActions.clearAuths,
    state => adapter.removeAll(state)
  ),
);

export const authsFeature = createFeature({
  name: authsFeatureKey,
  reducer,
  extraSelectors: ({ selectAuthsState }) => ({
    ...adapter.getSelectors(selectAuthsState)
  }),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = authsFeature;
