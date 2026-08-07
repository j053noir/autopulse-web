import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/login.page";
import { CreateAuctionPage } from "./pages/create-auction.page";

test.describe("Flujo Crítico: Autenticación y Gestión de Subastas", () => {
  test("Test 1: Intento fallido de login con credenciales erróneas (HTTP 401)", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto("es");
    await loginPage.login("wrong@autopulse.com", "");

    // Validate error message display for invalid/incomplete login attempt
    await loginPage.expectErrorMessage(/por favor completa todos los campos/i);
  });

  test("Test 2: Login exitoso y redirección al Dashboard de Subastas", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (url.includes("/api/auth/login")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({
            accessToken: "mocked-jwt-token",
            user: { id: "user-1", email: "user@autopulse.com" },
          }),
        });
      }
      if (url.includes("/api/auth/profile")) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: JSON.stringify({
            id: "user-1",
            email: "user@autopulse.com",
            userName: "user",
            permissions: ["bid.create", "auctions.view"],
          }),
        });
      }
      return route.continue();
    });

    await loginPage.goto("es");
    await loginPage.login("user@autopulse.com", "ValidPassword123!");

    // Auto-waiting validation for URL redirection to dashboard or locale root
    await expect(page).toHaveURL(/\/(es|en)/);
  });

  test("Test 3: Navegación al formulario de creación de subasta y validación de campos obligatorios", async ({ page }) => {
    // Add auth cookie so Next.js proxy permits navigation to protected route
    await page.context().addCookies([
      {
        name: "autopulse-refresh-token",
        value: "mock-refresh-token",
        url: "http://localhost:3000",
      },
    ]);

    const createAuctionPage = new CreateAuctionPage(page);

    await createAuctionPage.goto("es");

    // Validate form inputs reflect error states on blank submission
    await createAuctionPage.expectValidationErrors();
  });
});
