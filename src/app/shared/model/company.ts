export interface Company {
  id: string;
  parentId: string;
  accountId: string;
  name: string;
  retailerDomain: string;
  description: string;
  status: string;
  tags: string[];
  type: string;
}

export interface EditCompanySettings {
  "id"?: string;
  "accountId"?: string;
  "logoUrl": string;
  "telegramBotLink": string;
  "whatsappSupportLink": string;
  "senderEmail": string;
  "incomingEmail": string;
}
