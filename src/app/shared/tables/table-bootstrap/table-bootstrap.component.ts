import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  TemplateRef,
  ContentChild,
  AfterContentInit,
} from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-table-bootstrap',
  templateUrl: './table-bootstrap.component.html',
  styleUrls: ['./table-bootstrap.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TableBootstrapComponent {
  @Input() data: any[] = [];
  @Input() pageSize: number = 10;
  @Input() showPagination: boolean = true;

  @ContentChild('headerTemplate') headerTemplate!: TemplateRef<any>;
  @ContentChild('rowTemplate') rowTemplate!: TemplateRef<any>;

  currentPage: number = 1;
  searchText: string = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  get filteredData(): any[] {
    let result = [...this.data];

    if (this.searchText) {
      const searchLower = this.searchText.toLowerCase();
      result = result.filter((item) => {
        // Buscar en todas las propiedades del objeto
        return Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        );
      });
    }

    if (this.sortColumn) {
      result.sort((a, b) => {
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }

  get paginatedData(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  getShowingFrom(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getShowingTo(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }

  sort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }
  getKeys(obj: any): string[] {
    if (obj) {
      return Object.keys(obj);
    }
    return [];
  }
}
