import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/correo electrónico|email address/i);
    this.passwordInput = page.getByLabel(/contraseña|password/i);
    this.submitButton = page.getByRole("button", { name: /ingresar|enter/i });
    this.errorMessage = page.getByText(/credenciales incorrectas|error/i);
  }

  async goto(lang: string = "es") {
    await this.page.goto(`/${lang}/auth/login`);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectErrorMessage(messagePattern?: string | RegExp) {
    if (messagePattern) {
      await expect(this.page.getByText(messagePattern)).toBeVisible();
    } else {
      await expect(this.errorMessage).toBeVisible();
    }
  }
}
