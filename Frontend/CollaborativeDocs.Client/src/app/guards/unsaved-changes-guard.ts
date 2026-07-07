import { CanDeactivateFn } from '@angular/router';
import { CanDeactivateComponent } from '../models/can-deactivate';

export const unsavedChangesGuard: CanDeactivateFn<CanDeactivateComponent> = (
  component,
  currentRoute,
  currentState,
  nextState,
) => {
  if(component.canDeactivate())
  {
    return true;
  }
  return confirm(
    'You have unsaved changes. Are you sure you want to leave this page?'
  );

};
