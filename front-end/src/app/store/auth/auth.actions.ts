import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Auth } from './auth.model';

export const AuthActions = createActionGroup({
  source: 'Auth/API',
  events: {
    'Load Auths': props<{ auths: Auth[] }>(),
    'Add Auth': props<{ auth: Auth }>(),
    'Upsert Auth': props<{ auth: Auth }>(),
    'Add Auths': props<{ auths: Auth[] }>(),
    'Upsert Auths': props<{ auths: Auth[] }>(),
    'Update Auth': props<{ auth: Update<Auth> }>(),
    'Update Auths': props<{ auths: Update<Auth>[] }>(),
    'Delete Auth': props<{ id: string }>(),
    'Delete Auths': props<{ ids: string[] }>(),
    'Clear Auths': emptyProps(),
  }
});
