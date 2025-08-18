import { signal, computed } from '@angular/core';

export interface BaseState<T> {
  items: T[];
  loading: boolean;
  error: boolean;
}

export abstract class StateService<T> {
  protected _state = signal<BaseState<T>>({
    items: [],
    loading: false,
    error: false,
  });

  readonly items = computed(() => this._state().items);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  protected setLoading(value: boolean) {
    this._state.update((s) => ({ ...s, loading: value }));
  }

  protected setError(value: boolean) {
    this._state.update((s) => ({ ...s, error: value }));
  }

  protected setItems(items: T[]) {
    this._state.update((s) => ({ ...s, items }));
  }

  protected addItem(item: T) {
    this._state.update((s) => ({ ...s, items: [...s.items, item] }));
  }
}
