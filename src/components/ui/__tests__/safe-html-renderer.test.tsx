import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SafeHtmlRenderer } from '../safe-html-renderer';

describe('SafeHtmlRenderer Component', () => {
  it('Debe renderizar contenido HTML seguro correctamente', () => {
    render(
      <SafeHtmlRenderer htmlContent="<p>Vehículo en <strong>excelentes condiciones</strong></p>" />
    );

    const boldText = screen.getByText('excelentes condiciones');
    expect(boldText).toBeInTheDocument();
    expect(boldText.tagName).toBe('STRONG');
  });

  it('Debe eliminar scripts y eventos onerror maliciosos evadiendo XSS', () => {
    const maliciousPayload = `
      <div>
        <p>Texto normal</p>
        <script>window.hack = true;</script>
        <img src="invalid-img.jpg" onerror="alert('xss')" />
      </div>
    `;

    const { container } = render(
      <SafeHtmlRenderer htmlContent={maliciousPayload} />
    );

    // No debe existir la etiqueta script en el DOM
    expect(container.querySelector('script')).toBeNull();
    // La imagen no debe tener el atributo onerror
    const imgElement = container.querySelector('img');
    if (imgElement) {
      expect(imgElement.getAttribute('onerror')).toBeNull();
    }
  });
});
