import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { FormControl, AbstractControl } from '@angular/forms';
import { startWith } from 'rxjs/operators';

export const coercKeys = {
  bool: coerceBooleanProperty,
  number: coerceNumberProperty
};

export function coerceDecorator<
  T extends { [key in P]: O } = any,
  P extends string | symbol = string | symbol,
  I = any,
  O = any
>(coerceFn: (value: I, self: T) => O): PropertyDecorator {
  return function (target: T, propertyKey: P) {
    const key = Symbol();
    target[key] = target[propertyKey];
    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this[key];
      },
      set: function (v: I) {
        this[key] = coerceFn.call(this, v, this);
      },
    });
  };
}

export function coerc(key: keyof typeof coercKeys) {
  const fn = coercKeys[key];
  return coerceDecorator(fn);
}

/** Run state change on update */
export function change(coercKey?: keyof typeof coercKeys): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const key = Symbol();
    target[key] = target[propertyKey];
    const coerceFn = coercKey ? coercKeys[coercKey] : (v) => v;
    Object.defineProperty(target, propertyKey, {
      get: function () {
        return this[key];
      },
      set: function (v: any) {
        this[key] = coerceFn.call(this, v);
        this.stateChanges.next();
      },
    });
  };
}
