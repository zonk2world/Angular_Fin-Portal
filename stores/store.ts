import { Observable } from 'rxjs';
import { Patch, StoreSubject } from './StoreSubject';
import { environment } from '@env/environment';
import { Injectable } from '@angular/core';

/**
 * A base class not used directly but should be extended in child stores
 * Helps to provide state management using Observables and custom Behavior Subject
 *
 * See example.store.ts for uses
 *
 * @class StoreSubject<T>
 */
export class Store<T> {
  state$: Observable<T>;
  private _state$: StoreSubject<T>;

  constructor(initialState: T) {
    if (environment.production) {
      this._state$ = new StoreSubject(initialState);
    } else {
      const loggingMiddleware = next => {
        return (state: any) => {
          const newState = next(state);
          console.log(`[${this.constructor.name}]`, newState);
          return newState;
        };
      };

      this._state$ = new StoreSubject(initialState, [loggingMiddleware]);
    }

    // Subscribe to state$ to get updates for entire state object
    this.state$ = this._state$.asObservable();
  }

  /**
   * Get the state
   * Note this simply returns state object and not a Subject/Observable, so cannot
   * subscribe to changes to the state. To receive updated state, use select()
   * or subscribe to state$
   *
   * @return {T}
   */
  get state(): T {
    return this._state$.getValue();
  }

  /**
   * Use in child service methods to update state
   * @param {T} nextState
   */

  setState(nextState: T): void {
    this._state$.next(nextState);
  }

  /**
   * Use anywhere (i.e. may not be defined in child service)
   * to update a value in the state service
   * @param key: string - state property
   * @param fn: function
   */
  dispatch(fn: Patch<T>): void {
    this._state$.dispatch(fn);
  }

  /**
   * Subscribe to a single property in the state object and only get updates when that value changes
   * i.e. in component or wherever, this.storeName.select(state => state.xxx) will subscribe to xxx property
   *
   * @param fn
   * @return {Observable<any>}:
   */
  select(fn) {
    return this._state$.select(fn);
  }
}
