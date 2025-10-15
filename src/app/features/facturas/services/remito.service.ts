import { inject, Injectable, signal } from '@angular/core';
import { Remito } from 'src/app/core/models/database.type';
import { StateService } from 'src/app/core/services/state-service';
import { SupabaseService } from 'src/app/core/services/supabase.service';

@Injectable({
  providedIn: 'root'
})
export class RemitoService extends StateService<Remito> {
  remitos = signal<Remito[]>([]);
  private _supabaseClient = inject(SupabaseService).supabaseClient;
  addItemRemito(item: Remito) {
    this.remitos.update(remitos => [...remitos, item]);
  }
  deleteItemRemito(item: Remito) {
      this.remitos.update((items) =>
        items ? items.filter((i) => i.id !== item.id) : items
      );

    }
  
}
