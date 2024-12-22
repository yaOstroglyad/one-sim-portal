import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ADMIN_PERMISSION, AuthService, CustomersDataService, ProviderBundlesDataService } from '../../../shared';
import { CreateProductService } from './create-product.service';
import { ProductsDataService } from '../products-data.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-create-product',
	templateUrl: './create-product.component.html',
	styleUrls: ['./create-product.component.scss']
})
export class CreateProductComponent implements OnInit, OnDestroy {
	form: FormGroup;
	currencies = [];
	customers: any[] = [];
	allUsageTypes: any[] = [];
	timeUnits: string[] = [];
	providerBundles: any[] = [];
	parentProducts: any[] = [];
	subscriptions: Subscription[] = [];
	isAdmin: boolean;

	constructor(
		private fb: FormBuilder,
		public dialogRef: MatDialogRef<CreateProductComponent>,
		private providerBundlesDataService: ProviderBundlesDataService,
		private productsDataService: ProductsDataService,
		private customersDataService: CustomersDataService,
		private createProductService: CreateProductService,
		private authService: AuthService,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {

		this.form = this.fb.group({
			productCommand: this.fb.group({
				id: [''],
				parentId: [''],
				accountId: [''],
				bundleId: [''],
				name: ['', Validators.required],
				description: [''],
				price: [0, Validators.required],
				currency: ['', Validators.required],
				customers: [],
				isCorporate: [false]
			}),
			bundleCommand: this.fb.group({
				id: [''],
				parentId: [''],
				accountId: [''],
				serviceProviderId: [''],
				providerData: this.fb.group({
					additionalProp1: [''],
					additionalProp2: [''],
					additionalProp3: ['']
				}),
				name: ['', Validators.required],
				description: [''],
				usage: this.fb.array([this.createUsageGroup()]),
				validity: this.fb.group({
					period: [0, Validators.required],
					timeUnit: ['', Validators.required]
				}),
				isFlexible: [false]
			})
		});

		this.form.disable();

	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	ngOnInit(): void {
		this.isAdmin = this.authService.hasPermission(ADMIN_PERMISSION);

		if(this.isAdmin) {
			this.subscriptions.push(
				this.providerBundlesDataService.list().subscribe(bundles => {
					this.providerBundles = bundles;
				})
			);
		}

		this.subscriptions.push(
			this.productsDataService.getParentProducts().subscribe(products => {
				this.parentProducts = products;
			})
		);

		this.subscriptions.push(
			this.customersDataService.list().subscribe(customers => {
				this.customers = customers;
			})
		);

		this.subscriptions.push(
			this.createProductService.getUnitTypes().subscribe(unitTypes => {
				this.allUsageTypes = unitTypes;
			})
		);

		this.subscriptions.push(
			this.createProductService.getTimeUnits().subscribe(timeUnits => {
				this.timeUnits = timeUnits;
			})
		);

		this.subscriptions.push(
			this.productsDataService.getCurrencies().subscribe(currencies => {
				this.currencies = currencies;
			})
		);
	}


	createUsageGroup(): FormGroup {
		return this.fb.group({
			value: [0, Validators.required],
			type: ['', Validators.required],
			unitType: ['', Validators.required]
		});
	}

	get usageArray(): FormArray {
		return this.form.get('bundleCommand.usage') as FormArray;
	}

	addUsage() {
		if (this.usageArray.length < 3) {
			this.usageArray.push(this.createUsageGroup());
		}
	}

	removeUsage(index: number) {
		this.usageArray.removeAt(index);
	}

	getSelectedUsageTypes(): string[] {
		return this.usageArray.controls.map(group => group.get('type')?.value);
	}

	isUsageTypeDisabled(type: string): boolean {
		return this.getSelectedUsageTypes().includes(type);
	}

	getUnitTypesForType(type: string): string[] {
		const usageType = this.allUsageTypes.find(ut => ut.type === type);
		return usageType ? usageType.unitTypes : [];
	}

	close(): void {
		this.dialogRef.close();
	}

	submit(): void {
		this.form.dirty && this.form.valid ? this.dialogRef.close(this.form.value) : this.dialogRef.close();
	}

	onProviderBundleOrProductChange(id: string) {

    let params: any = {};

    if (this.isAdmin) {
      params.bundleId = id;
    }
    if (!this.isAdmin) {
      params.productId = id;
    }

		this.subscriptions.push(
			this.productsDataService.getProductTemplate(params).subscribe(template => {
				this.form.patchValue({
					productCommand: {
						id: template.productCommand.id,
						parentId: template.productCommand.parentId,
						accountId: template.productCommand.accountId,
						bundleId: id,
						name: template.productCommand.name,
						description: template.productCommand.description,
						price: template.productCommand.price,
						currency: template.productCommand.currency,
						isCorporate: template.productCommand.isCorporate || false
					},
					bundleCommand: {
						id: template.bundleCommand.id,
						parentId: template.bundleCommand.parentId,
						accountId: template.bundleCommand.accountId,
						serviceProviderId: template.bundleCommand.serviceProviderId,
						providerData: {
							additionalProp1: template.bundleCommand.providerData?.additionalProp1,
							additionalProp2: template.bundleCommand.providerData?.additionalProp2,
							additionalProp3: template.bundleCommand.providerData?.additionalProp3
						},
						name: template.bundleCommand.name,
						description: template.bundleCommand.description,
						validity: {
							period: template.bundleCommand.validity.period,
							timeUnit: template.bundleCommand.validity.timeUnit
						},
						isFlexible: template.bundleCommand.isFlexible
					}
				});

				// Clear and repopulate the usage array
				this.usageArray.clear();
				template.bundleCommand.usage.forEach(usage => {
					this.usageArray.push(this.fb.group({
						value: usage.value,
						type: usage?.type ? usage.type : 'data',
						unitType: usage.unitType
					}));
				});

				this.form.enable();

				if (!template.bundleCommand.isFlexible) {
					this.form.get('bundleCommand').disable();
				}

				this.form.markAsDirty();
			})
		);
	}
}
