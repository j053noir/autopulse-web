import { Page, Locator, expect } from "@playwright/test";

export class CreateAuctionPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly vinInput: Locator;
  readonly fileInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator("input[name='title']");
    this.vinInput = page.locator("input[name='vin']");
    this.fileInput = page.locator("input[type='file']");
    this.submitButton = page.locator("button[type='submit']");
  }

  async goto(lang: string = "es") {
    await this.page.goto(`/${lang}/auctions/create`);
  }

  async submit() {
    await this.submitButton.click();
  }

  async expectValidationErrors() {
    // When document is missing, the submit button is disabled by form policy
    await expect(this.submitButton).toBeDisabled();
  }
}
