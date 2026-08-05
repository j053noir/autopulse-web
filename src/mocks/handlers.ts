import { http, HttpResponse } from 'msw';

export const handlers = [
  // Upload URL mock
  http.post('*/api/auctions/upload-url', () => {
    return HttpResponse.json({
      uploadUrl: 'https://storage.azure.com/fake-sas-url',
      storageKey: 'docs/test-doc-123.pdf',
    });
  }),

  // Upload file mock to Azure Storage
  http.put('https://storage.azure.com/fake-sas-url', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Create auction mock
  http.post('*/api/auctions', async ({ request }) => {
    const body = (await request.json()) as any;

    // Simulate server-side validation error if vin is INVALID_VIN_SERVER
    if (body.vin === 'INVALID_VIN_SERVER') {
      return HttpResponse.json(
        {
          message: 'Error de validación del servidor',
          errors: {
            Vin: ['El VIN no existe en la base de datos nacional.'],
          },
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        id: 'auction-guid-12345',
        title: body.title,
        status: 'Active',
      },
      { status: 201 }
    );
  }),

  // Bids mock
  http.post('*/api/auctions/:id/bids', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      id: 'bid-999',
      amount: body.amount,
      createdAt: new Date().toISOString(),
    });
  }),
];
