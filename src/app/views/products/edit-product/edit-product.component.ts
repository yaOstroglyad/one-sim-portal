import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CustomersDataService, CustomerType } from '../../../shared';
import { SessionStorageService } from 'ngx-webstorage';
import { ProductsDataService } from '../products-data.service';

@Component({
	selector: 'app-edit-product',
	templateUrl: './edit-product.component.html',
	styleUrls: ['./edit-product.component.scss']
})
export class EditProductComponent implements OnInit {
	form: FormGroup = new FormGroup({
		id: new FormControl(null),
		name: new FormControl(null),
		description: new FormControl(null),
		price: new FormControl(null),
		currency: new FormControl(null),
		isCorporate: new FormControl(false),
		customers: new FormControl([])
	});

	currencies = [];
	customers = [];
	isAdmin: boolean;

	constructor(
		public dialogRef: MatDialogRef<EditProductComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private customersDataService: CustomersDataService,
		private productsDataService: ProductsDataService,
		private $sessionStorage: SessionStorageService
	) {
		this.isAdmin = this.$sessionStorage.retrieve('isAdmin');
	}

	ngOnInit(): void {
		this.loadCurrencies();
		this.loadCustomers();
	}

	private initializeFormData(data: any): void {
		this.form.patchValue({
			id: data.id || null,
			name: data.name || '',
			description: data.description || '',
			price: data.price || '',
			currency: data.currency || '',
			isCorporate: data.isCorporate || false,
			customers: data.customers.map(c => c.id) || []
		});
	}

	private loadCustomers(): void {
		this.customersDataService.list(CustomerType.Corporate).subscribe(customers => {
			this.customers = customers;
			if (this.data) {
				this.initializeFormData(this.data);
			}
		});
	}

	private loadCurrencies(): void {
		this.productsDataService.getCurrencies().subscribe(currencies => {
			this.currencies = currencies;
		});
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.form.dirty && this.form.valid ? this.dialogRef.close(this.form.value) : this.dialogRef.close();
	}
}
