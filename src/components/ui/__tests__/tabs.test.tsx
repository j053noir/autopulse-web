import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';

describe('Tabs Component', () => {
  it('Debe renderizar la pestaña inicial marcada por defaultValue', () => {
    render(
      <Tabs defaultValue="activos">
        <TabsList>
          <TabsTrigger value="activos">Vehículos Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="activos">
          <p>Lista de vehículos activos</p>
        </TabsContent>
        <TabsContent value="historial">
          <p>Lista de historial de ventas</p>
        </TabsContent>
      </Tabs>
    );

    expect(screen.getByText('Lista de vehículos activos')).toBeInTheDocument();
    expect(screen.queryByText('Lista de historial de ventas')).not.toBeInTheDocument();
  });

  it('Debe cambiar de contenido activo al hacer click en otro TabsTrigger', async () => {
    const user = userEvent.setup();

    render(
      <Tabs defaultValue="activos">
        <TabsList>
          <TabsTrigger value="activos">Vehículos Activos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="activos">
          <p>Lista de vehículos activos</p>
        </TabsContent>
        <TabsContent value="historial">
          <p>Lista de historial de ventas</p>
        </TabsContent>
      </Tabs>
    );

    const historyTab = screen.getByRole('button', { name: /historial/i });
    await user.click(historyTab);

    expect(screen.getByText('Lista de historial de ventas')).toBeInTheDocument();
    expect(screen.queryByText('Lista de vehículos activos')).not.toBeInTheDocument();
  });
});
