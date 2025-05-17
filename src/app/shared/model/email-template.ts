export interface EmailTemplate {
	id: string;
	owner: {
		id: string;
		name: string;
	};
	templateId: string;
	subject: string;
	type: string;
	language: string;
	primary: true
}

export interface EditEmailTemplateIntegration {
	id?: string;
	templateId: string;
	subject: string;
	language: string;
	type: string;
	ownerAccountId?: string;
}
