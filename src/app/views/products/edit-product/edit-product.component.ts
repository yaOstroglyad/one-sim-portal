import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	ADMIN_PERMISSION,
	AuthService,
	CompaniesDataService,
	ProductsDataService
} from '../../../shared';

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
		companies: new FormControl([])
	});

	currencies = [];
	companies = [];
	isAdmin: boolean;

	constructor(
		public dialogRef: MatDialogRef<EditProductComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private companiesDataService: CompaniesDataService,
		private productsDataService: ProductsDataService,
		private authService: AuthService,
	) {
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);
	}

	ngOnInit(): void {
		this.loadCurrencies();
		this.loadCompanies();
	}

	private initializeFormData(data: any): void {
		this.form.patchValue({
			id: data.id || null,
			name: data.name || '',
			description: data.description || '',
			price: data.price || '',
			currency: data.currency || '',
			isCorporate: data.isCorporate || false,
			companies: data.companies.map(c => c.id) || []
		});
	}

	private loadCompanies(): void {
		this.companiesDataService.list().subscribe(companies => {
			this.companies = companies;
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
