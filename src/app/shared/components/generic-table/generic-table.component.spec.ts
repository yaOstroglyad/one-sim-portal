import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { of, firstValueFrom } from 'rxjs';

import { GenericTableComponent } from './generic-table.component';
import { configureTestBed } from '@shared/utils/testing';
import { TableConfig, TableColumnConfig } from '@shared/models';
import { TableRow } from './models/table-row.interface';

/**
 * Test model extending TableRow
 */
interface TestRow extends TableRow {
  id: number;
  name: string;
  amount: number;
}

describe('GenericTableComponent', () => {
  let component: GenericTableComponent<TestRow>;
  let fixture: ComponentFixture<GenericTableComponent<TestRow>>;

  // Mock data
  const mockColumns: TableColumnConfig[] = [
    { key: 'id', header: 'ID', visible: true, sortable: true },
    { key: 'name', header: 'Name', visible: true, sortable: true },
    { key: 'amount', header: 'Amount', visible: true, sortable: false }
  ];

  const mockConfig: TableConfig = {
    columns: mockColumns,
    showCheckboxes: true,
    pagination: {
      enabled: true,
      serverSide: false,
      totalPages: 5
    }
  };

  const mockData: TestRow[] = [
    { id: 1, name: 'Item 1', amount: 100 },
    { id: 2, name: 'Item 2', amount: 200 },
    { id: 3, name: 'Item 3', amount: 300 }
  ];

  // Setup
  beforeEach(async () => {
    await configureTestBed({
      imports: [GenericTableComponent]
    });

    fixture = TestBed.createComponent(GenericTableComponent<TestRow>);
    component = fixture.componentInstance;
  });

  // Helper to initialize component with data
  function initializeComponent(config = mockConfig, data = mockData): void {
    component.config$ = of(config);
    component.data$ = of(data);
    component.ngOnChanges({
      config$: new SimpleChange(null, component.config$, true),
      data$: new SimpleChange(null, component.data$, true)
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should have default values', () => {
      // Assert
      expect(component.currentPage).toBe(0);
      expect(component.pageSize).toBe(15);
      expect(component.totalPages).toBe(0);
      expect(component.isRowClickable).toBe(false);
      expect(component.selectedItems.size).toBe(0);
    });

    it('should create viewModel$ when config$ and data$ are provided', () => {
      // Act
      initializeComponent();

      // Assert
      expect(component.viewModel$).toBeDefined();
    });

    it('should set totalPages from config pagination', async () => {
      // Act
      initializeComponent();

      // Assert
      const vm = await firstValueFrom(component.viewModel$);
      expect(component.totalPages).toBe(5);
      expect(vm.data).toEqual(mockData);
    });

    it('should not create viewModel$ if config$ is missing', () => {
      // Arrange
      component.data$ = of(mockData);

      // Act
      component.ngOnChanges({
        data$: new SimpleChange(null, component.data$, true)
      });

      // Assert
      expect(component.viewModel$).toBeUndefined();
    });

    it('should not create viewModel$ if data$ is missing', () => {
      // Arrange
      component.config$ = of(mockConfig);

      // Act
      component.ngOnChanges({
        config$: new SimpleChange(null, component.config$, true)
      });

      // Assert
      expect(component.viewModel$).toBeUndefined();
    });
  });

  describe('pagination', () => {
    beforeEach(() => {
      initializeComponent();
    });

    it('should emit pageChange event when changePage is called', () => {
      // Arrange
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

      // Act
      component.changePage(2);

      // Assert
      expect(component.currentPage).toBe(2);
      expect(pageChangeSpy).toHaveBeenCalledWith({
        page: 2,
        size: 15,
        isServerSide: undefined
      });
    });

    it('should emit pageChange with isServerSide flag', () => {
      // Arrange
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

      // Act
      component.changePage(1, true);

      // Assert
      expect(pageChangeSpy).toHaveBeenCalledWith({
        page: 1,
        size: 15,
        isServerSide: true
      });
    });

    it('should reset page to 0 when page size changes', () => {
      // Arrange
      component.currentPage = 3;
      const pageChangeSpy = jest.spyOn(component.pageChange, 'emit');

      // Act
      component.onPageSizeChange(25);

      // Assert
      expect(component.pageSize).toBe(25);
      expect(component.currentPage).toBe(0);
      expect(pageChangeSpy).toHaveBeenCalledWith({
        page: 0,
        size: 25,
        isServerSide: false
      });
    });
  });

  describe('selection', () => {
    beforeEach(() => {
      initializeComponent();
    });

    it('should select all items when toggleAll is called with checked', () => {
      // Arrange
      const selectionSpy = jest.spyOn(component.selectedItemsChange, 'emit');
      const mockEvent = { target: { checked: true } } as unknown as Event;

      // Act
      component.toggleAll(mockEvent);

      // Assert
      expect(component.selectedItems.size).toBe(3);
      expect(selectionSpy).toHaveBeenCalledWith(mockData);
    });

    it('should deselect all items when toggleAll is called with unchecked', () => {
      // Arrange
      mockData.forEach(item => component.selectedItems.add(item));
      const selectionSpy = jest.spyOn(component.selectedItemsChange, 'emit');
      const mockEvent = { target: { checked: false } } as unknown as Event;

      // Act
      component.toggleAll(mockEvent);

      // Assert
      expect(component.selectedItems.size).toBe(0);
      expect(selectionSpy).toHaveBeenCalledWith([]);
    });

    it('should add item to selection when toggleItemSelection is called with checked', () => {
      // Arrange
      const selectionSpy = jest.spyOn(component.selectedItemsChange, 'emit');
      const mockEvent = { target: { checked: true } } as unknown as Event;

      // Act
      component.toggleItemSelection(mockData[0], mockEvent);

      // Assert
      expect(component.selectedItems.has(mockData[0])).toBe(true);
      expect(selectionSpy).toHaveBeenCalledWith([mockData[0]]);
    });

    it('should remove item from selection when toggleItemSelection is called with unchecked', () => {
      // Arrange
      component.selectedItems.add(mockData[0]);
      const selectionSpy = jest.spyOn(component.selectedItemsChange, 'emit');
      const mockEvent = { target: { checked: false } } as unknown as Event;

      // Act
      component.toggleItemSelection(mockData[0], mockEvent);

      // Assert
      expect(component.selectedItems.has(mockData[0])).toBe(false);
      expect(selectionSpy).toHaveBeenCalledWith([]);
    });

    it('should return true for isSelected when item is selected', () => {
      // Arrange
      component.selectedItems.add(mockData[1]);

      // Assert
      expect(component.isSelected(mockData[1])).toBe(true);
      expect(component.isSelected(mockData[0])).toBe(false);
    });
  });

  describe('sorting', () => {
    let sortableColumn: TableColumnConfig;
    let nonSortableColumn: TableColumnConfig;

    beforeEach(() => {
      sortableColumn = { key: 'name', header: 'Name', visible: true, sortable: true, sortDirection: null };
      nonSortableColumn = { key: 'amount', header: 'Amount', visible: true, sortable: false };

      initializeComponent({ columns: [sortableColumn, nonSortableColumn] });
    });

    it('should toggle sort direction from null to asc', () => {
      // Arrange
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      // Act
      component.onSortColumn(sortableColumn);

      // Assert
      expect(sortableColumn.sortDirection).toBe('asc');
      expect(sortSpy).toHaveBeenCalledWith({ column: 'name', direction: 'asc' });
    });

    it('should toggle sort direction from asc to desc', () => {
      // Arrange
      sortableColumn.sortDirection = 'asc';
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      // Act
      component.onSortColumn(sortableColumn);

      // Assert
      expect(sortableColumn.sortDirection).toBe('desc');
      expect(sortSpy).toHaveBeenCalledWith({ column: 'name', direction: 'desc' });
    });

    it('should toggle sort direction from desc to asc', () => {
      // Arrange
      sortableColumn.sortDirection = 'desc';
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      // Act
      component.onSortColumn(sortableColumn);

      // Assert
      expect(sortableColumn.sortDirection).toBe('asc');
      expect(sortSpy).toHaveBeenCalledWith({ column: 'name', direction: 'asc' });
    });

    it('should not emit sortChange for non-sortable column', () => {
      // Arrange
      const sortSpy = jest.spyOn(component.sortChange, 'emit');

      // Act
      component.onSortColumn(nonSortableColumn);

      // Assert
      expect(sortSpy).not.toHaveBeenCalled();
    });

    it('should reset other columns sort direction when sorting new column', () => {
      // Arrange
      const anotherSortableColumn: TableColumnConfig = {
        key: 'id',
        header: 'ID',
        visible: true,
        sortable: true,
        sortDirection: 'asc'
      };
      initializeComponent({ columns: [sortableColumn, anotherSortableColumn] });

      // Act
      component.onSortColumn(sortableColumn);

      // Assert
      expect(anotherSortableColumn.sortDirection).toBeNull();
      expect(sortableColumn.sortDirection).toBe('asc');
    });
  });

  describe('row actions', () => {
    beforeEach(() => {
      initializeComponent();
    });

    it('should emit toggleAction when onEdit is called', () => {
      // Arrange
      const editSpy = jest.spyOn(component.toggleAction, 'emit');

      // Act
      component.onEdit(mockData[0]);

      // Assert
      expect(editSpy).toHaveBeenCalledWith(mockData[0]);
    });

    it('should emit onRowClickEvent when onRowClick is called', () => {
      // Arrange
      const rowClickSpy = jest.spyOn(component.onRowClickEvent, 'emit');

      // Act
      component.onRowClick(mockData[1]);

      // Assert
      expect(rowClickSpy).toHaveBeenCalledWith(mockData[1]);
    });
  });

  describe('utility methods', () => {
    it('should track by id', () => {
      expect(component.trackById(0, mockData[0])).toBe(1);
    });

    it('should identify even indices', () => {
      expect(component.isEven(0)).toBe(true);
      expect(component.isEven(2)).toBe(true);
      expect(component.isEven(1)).toBe(false);
    });

    it('should identify odd indices', () => {
      expect(component.isOdd(1)).toBe(true);
      expect(component.isOdd(3)).toBe(true);
      expect(component.isOdd(0)).toBe(false);
    });
  });

  describe('viewModel$ updates', () => {
    it('should recreate viewModel$ when inputs change', async () => {
      // Arrange
      initializeComponent();
      const firstViewModel$ = component.viewModel$;

      // Act
      const newData = [{ id: 4, name: 'Item 4', amount: 400 }];
      component.data$ = of(newData);
      component.ngOnChanges({
        data$: new SimpleChange(of(mockData), component.data$, false)
      });

      // Assert
      expect(component.viewModel$).not.toBe(firstViewModel$);
      const vm = await firstValueFrom(component.viewModel$);
      expect(vm.data).toEqual(newData);
    });
  });
});
